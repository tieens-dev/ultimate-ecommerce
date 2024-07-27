import { Injectable, NestMiddleware } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response, NextFunction } from 'express'

import { HelperArrayService } from '@common/helpers/services'
import { IRequestApp } from '@common/request/interfaces/request.interface'

@Injectable()
export class MessageCustomLanguageMiddleware implements NestMiddleware {
  private readonly availableLanguage: string[]

  constructor(
    private readonly configService: ConfigService,
    private readonly helperArrayService: HelperArrayService
  ) {
    this.availableLanguage = this.configService.get<string[]>(
      'message.availableLanguage'
    )
  }

  async use(req: IRequestApp, _: Response, next: NextFunction): Promise<void> {
    let customLang: string = this.configService.get<string>('message.language')

    const reqLanguages: string = req.headers['X-Custom-Language'] as string
    if (reqLanguages) {
      const language: string[] = this.filterLanguage(reqLanguages)

      if (language.length > 0) {
        customLang = reqLanguages
      }
    }

    req.__language = customLang
    req.headers['X-Custom-Language'] = customLang

    next()
  }

  private filterLanguage(customLanguage: string): string[] {
    return this.helperArrayService.getIntersection(
      [customLanguage],
      this.availableLanguage
    )
  }
}
