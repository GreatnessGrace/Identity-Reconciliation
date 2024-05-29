"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_source_1 = require("./data-source");
const contactRouter_1 = __importDefault(require("./router/contactRouter"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const path_1 = __importDefault(require("path"));
app.use('/', contactRouter_1.default);
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'index.html'));
});
data_source_1.AppDataSource.initialize().then(() => {
    app.listen(10000, () => {
        console.log('Server is running on port 3000');
    });
}).catch(error => console.log(error));
