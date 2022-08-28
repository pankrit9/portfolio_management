"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.grabStudent = void 0;
function grabStudent(stuKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const axios = require('axios').default;
        return axios.get(`http://localhost:8080/${stuKey}`)
            .then(function (response) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                return (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.student;
            });
        })
            .catch(function (error) {
            console.log(error);
        });
    });
}
exports.grabStudent = grabStudent;
