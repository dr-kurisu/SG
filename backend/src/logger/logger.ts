import winston from 'winston';
import path from 'path'

const logger = winston.createLogger({
    level: 'info', // 设置日志级别
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.errors({ stack: true }),
        winston.format.printf(info => {
            const { timestamp, level, message, stack, ...rest } = info;
            const restStr = Object.keys(rest).length ? ` ${JSON.stringify(rest, null, 2)}` : "";
            const upperLevel = level.toUpperCase();
            return stack
                ? `[${timestamp}] ${upperLevel}: ${message}${restStr}\n${stack}`
                : `[${timestamp}] ${upperLevel}: ${message}${restStr}`;
        }),
        winston.format.colorize({ all: true }),
    ),
    transports: [
        new winston.transports.Console({

        }),
        new winston.transports.File({ filename: path.join(__dirname, "combined.log") }),
        new winston.transports.File({ filename: path.join(__dirname, "error.log"), level: 'error' }), // Log errors to a file
    ],
});

// 在生产环境禁用 debug 日志
if (process.env.NODE_ENV === 'production') {
    logger.level = 'warn';
} else {
    logger.level = 'debug';
}

export default logger;
