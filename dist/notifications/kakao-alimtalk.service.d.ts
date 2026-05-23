import { ConfigService } from '@nestjs/config';
export interface AlimtalkMessage {
    receiver: string;
    templateCode: string;
    variables: Record<string, string>;
}
export declare class KakaoAlimtalkService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendAlimtalk(messages: AlimtalkMessage[]): Promise<boolean>;
    private buildMessage;
}
