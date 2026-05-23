"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashMeetingsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const flash_meeting_entity_1 = require("./flash-meeting.entity");
const flash_meetings_service_1 = require("./flash-meetings.service");
const flash_meetings_controller_1 = require("./flash-meetings.controller");
const meetings_module_1 = require("../meetings/meetings.module");
let FlashMeetingsModule = class FlashMeetingsModule {
};
exports.FlashMeetingsModule = FlashMeetingsModule;
exports.FlashMeetingsModule = FlashMeetingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([flash_meeting_entity_1.FlashMeeting]),
            bull_1.BullModule.registerQueue({ name: 'notifications' }),
            meetings_module_1.MeetingsModule,
        ],
        providers: [flash_meetings_service_1.FlashMeetingsService],
        controllers: [flash_meetings_controller_1.FlashMeetingsController],
        exports: [flash_meetings_service_1.FlashMeetingsService],
    })
], FlashMeetingsModule);
//# sourceMappingURL=flash-meetings.module.js.map