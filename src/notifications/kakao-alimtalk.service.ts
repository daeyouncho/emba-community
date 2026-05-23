import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface AlimtalkMessage {
  receiver: string; // 수신자 전화번호
  templateCode: string;
  variables: Record<string, string>;
}

@Injectable()
export class KakaoAlimtalkService {
  private readonly logger = new Logger(KakaoAlimtalkService.name);

  constructor(private configService: ConfigService) {}

  async sendAlimtalk(messages: AlimtalkMessage[]): Promise<boolean> {
    const apiKey = this.configService.get('KAKAO_REST_API_KEY');
    const senderKey = this.configService.get('KAKAO_ALIMTALK_SENDER_KEY');
    const apiUrl = this.configService.get('BIZMESSAGE_API_URL');

    if (!apiKey || !senderKey) {
      this.logger.warn('[카카오 알림톡] API 키 미설정. 알림 전송 스킵.');
      return false;
    }

    try {
      const payload = {
        apikey: apiKey,
        userid: 'emba_admin',
        senderkey: senderKey,
        tpl_code: messages[0].templateCode,
        sender: this.configService.get('KAKAO_ALIMTALK_PHONE'),
        receiver_1: messages[0].receiver,
        subject_1: '모임 알림',
        message_1: this.buildMessage(messages[0]),
        failover: 'N',
      };

      const response = await axios.post(`${apiUrl}/send/`, payload);
      this.logger.log(`카카오 알림톡 전송 결과: ${JSON.stringify(response.data)}`);
      return response.data.result_code === '1';
    } catch (error) {
      this.logger.error('카카오 알림톡 전송 실패', error.message);
      return false;
    }
  }

  private buildMessage(msg: AlimtalkMessage): string {
    const templates: Record<string, string> = {
      MEETING_VOTE_START: `안녕하세요 #{name}님!\n\n교수님 모임 투표가 시작되었습니다.\n\n📋 모임명: #{title}\n🗳️ 투표 마감: #{deadline}\n\n지금 바로 투표에 참여해주세요!`,
      MEETING_CONFIRMED: `안녕하세요 #{name}님!\n\n모임이 확정되었습니다! 🎉\n\n📋 모임명: #{title}\n📅 일시: #{date}\n📍 장소: #{location}\n\n많은 참여 부탁드립니다!`,
      FLASH_MEETING_NEARBY: `안녕하세요 #{name}님!\n\n근처에 번개 모임이 생겼어요! ⚡\n\n📋 #{title}\n📍 #{location} (#{radius}km 이내)\n⏰ #{expires_at}까지\n\n지금 바로 참여하세요!`,
      BIRTH_YEAR_MEETING: `안녕하세요 #{name}님!\n\n#{birth_year}년생 동기 모임 안내입니다! 🎂\n\n📋 #{title}\n📅 #{date}\n📍 #{location}`,
    };

    let template = templates[msg.templateCode] || '모임 알림이 도착했습니다.';
    Object.entries(msg.variables).forEach(([key, value]) => {
      template = template.replace(new RegExp(`#\\{${key}\\}`, 'g'), value);
    });
    return template;
  }
}
