import { transports, createLogger, format } from 'winston';
import { logger } from '.';




function loggerAdmin(level?: string, message?: string, messageOccured?: string): void {
  logger().log({
    timestamp: new Date().toJSON(),
    level,
    message,
    messageOccured
  })
}

export default loggerAdmin;