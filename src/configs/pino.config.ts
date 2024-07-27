import { registerAs } from '@nestjs/config'
import pino, { LoggerOptions } from 'pino'
import { customLevels } from '@zemd/nestjs-pino-logger'
import { context, isSpanContextValid, trace } from '@opentelemetry/api'

export default registerAs('pino', (): Partial<LoggerOptions> => {
  const targets: pino.TransportTargetOptions<Record<string, any>>[] = []

  if (process.env.NODE_ENV !== 'production') {
    // you don't need to use this transport in production, usually you would want to send logs as json object to the observability service
    targets.push({
      target: '@zemd/nestjs-pino-logger/dist/pino-pretty-transport.js',
      level: process.env.NODE_ENV === 'development' ? 'verbose' : 'error',
      options: {
        colorize: false,
        translateTime: true,
        include: '',
        singleLine: false,
        hideObject: true
      }
    })
  }

  const transport = targets.length ? { targets } : undefined

  return {
    customLevels,
    transport,
    mixin: () => {
      const record = {}
      const span = trace.getSpan(context.active())
      if (span) {
        const spanContext = span.spanContext()

        if (isSpanContextValid(spanContext)) {
          Object.assign(record, {
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId,
            trace_flags: `0${spanContext.traceFlags.toString(16)}`
          })
        }
      }

      return record
    }
  }
})
