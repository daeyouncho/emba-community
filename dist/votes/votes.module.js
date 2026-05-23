"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const vote_entity_1 = require("./vote.entity");
const meeting_entity_1 = require("../meetings/meeting.entity");
const votes_service_1 = require("./votes.service");
const votes_controller_1 = require("./votes.controller");
let VotesModule = class VotesModule {
};
exports.VotesModule = VotesModule;
exports.VotesModule = VotesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([vote_entity_1.Vote, meeting_entity_1.Meeting]),
            bull_1.BullModule.registerQueue({ name: 'notifications' }),
        ],
        providers: [votes_service_1.VotesService],
        controllers: [votes_controller_1.VotesController],
        exports: [votes_service_1.VotesService],
    })
], VotesModule);
//# sourceMappingURL=votes.module.js.map