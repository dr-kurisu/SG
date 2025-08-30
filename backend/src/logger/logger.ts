import winston from 'winston';

const logger = winston.createLogger({
    level: 'info', // 设置日志级别
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),  // 给日志添加颜色，使输出更加可读
                winston.format.simple(),
            )
        }),
        new winston.transports.File({ filename: 'combined.log' })
    ],
});

// 在生产环境禁用 debug 日志
if (process.env.NODE_ENV === 'production') {
    logger.level = 'warn';
} else {
    logger.level = 'debug';
}

export default logger;
