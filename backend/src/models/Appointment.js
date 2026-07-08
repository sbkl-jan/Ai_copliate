"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AppointmentSchema = new mongoose_1.Schema({
    businessId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Business', required: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'no-show', 'completed'],
        default: 'pending',
        required: true,
    },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    source: {
        type: String,
        enum: ['chat', 'voice', 'manual', 'portal'],
        default: 'manual',
        required: true,
    },
    reminderSent: { type: Boolean, default: false },
}, { timestamps: true });
// Compound index to help quickly find conflicts
AppointmentSchema.index({ businessId: 1, startTime: 1, endTime: 1 });
AppointmentSchema.index({ customerEmail: 1 });
exports.default = mongoose_1.default.model('Appointment', AppointmentSchema);
//# sourceMappingURL=Appointment.js.map