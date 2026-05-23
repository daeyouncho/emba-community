"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const typeorm_1 = require("@nestjs/typeorm");
const notification_processor_1 = require("./processors/notification.processor");
const kakao_alimtalk_service_1 = require("./kakao-alimtalk.service");
const user_entity_1 = require("../users/user.entity");
const meetings_module_1 = require("../meetings/meetings.module");
const flash_meetings_module_1 = require("../flash-meetings/flash-meetings.module");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            bull_1.BullModule.registerQueue({ name: 'notifications' }),
            meetings_module_1.MeetingsModule,
            flash_meetings_module_1.FlashMeetingsModule,
        ],
        providers: [notification_processor_1.NotificationProcessor, kakao_alimtalk_service_1.KakaoAlimtalkService],
        exports: [kakao_alimtalk_service_1.KakaoAlimtalkService],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map