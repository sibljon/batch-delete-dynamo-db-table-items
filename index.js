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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var AWS = require("aws-sdk");
// Based on https://stackoverflow.com/a/57598497/670400
// Customization 1: choose your region
var DynamoDb = new AWS.DynamoDB.DocumentClient({
    region: "us-east-1"
});
// Customiation 2: specify the table name
var tableName = "dev-invite";
// Customization 3: specify the hash key for your table
var hashKey = "InviteToken";
// Customization 4: add logic to determine which (return true if you want to delete the respective item)
// If you don't want to filter anything out, then just return true in this function (or remove the filter step below, where this filter is used)
var shouldDeleteItem = function (item) {
    return item.Type === "SECURE_MESSAGE" || item.Type === "PATIENT";
};
exports.getAllItemsFromTable = function (lastEvaluatedKey) { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, DynamoDb.scan({
                    TableName: tableName,
                    ExclusiveStartKey: lastEvaluatedKey
                }).promise()];
            case 1:
                res = _a.sent();
                return [2 /*return*/, { items: res.Items, lastEvaluatedKey: res.LastEvaluatedKey }];
        }
    });
}); };
exports.deleteAllItemsFromTable = function (items) { return __awaiter(void 0, void 0, void 0, function () {
    var numItemsDeleted;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                numItemsDeleted = 0;
                // Split items into patches of 25
                // 25 items is max for batchWrite
                return [4 /*yield*/, asyncForEach(split(items, 25), function (patch, i) { return __awaiter(void 0, void 0, void 0, function () {
                        var requestItems;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    requestItems = (_a = {},
                                        _a[tableName] = patch.filter(shouldDeleteItem).map(function (item) {
                                            var _a;
                                            numItemsDeleted++;
                                            return {
                                                DeleteRequest: {
                                                    Key: (_a = {},
                                                        _a[hashKey] = item[hashKey],
                                                        _a)
                                                }
                                            };
                                        }),
                                        _a);
                                    if (!(requestItems[tableName].length > 0)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, DynamoDb.batchWrite({ RequestItems: requestItems }).promise()];
                                case 1:
                                    _b.sent();
                                    console.log("finished deleting " + numItemsDeleted + " items this batch");
                                    _b.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); })];
            case 1:
                // Split items into patches of 25
                // 25 items is max for batchWrite
                _a.sent();
                return [2 /*return*/, { numItemsDeleted: numItemsDeleted }];
        }
    });
}); };
function split(arr, n) {
    var res = [];
    while (arr.length) {
        res.push(arr.splice(0, n));
    }
    return res;
}
function asyncForEach(array, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var index;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    index = 0;
                    _a.label = 1;
                case 1:
                    if (!(index < array.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, callback(array[index], index, array)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    index++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function letsGo() {
    return __awaiter(this, void 0, void 0, function () {
        var lastEvaluatedKey, totalItemsFetched, totalItemsDeleted, _a, items, lek, numItemsDeleted;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    totalItemsFetched = 0;
                    totalItemsDeleted = 0;
                    _b.label = 1;
                case 1: return [4 /*yield*/, exports.getAllItemsFromTable(lastEvaluatedKey)];
                case 2:
                    _a = _b.sent(), items = _a.items, lek = _a.lastEvaluatedKey;
                    totalItemsFetched += items.length;
                    console.log("--- a group of " + items.length + " was fetched");
                    return [4 /*yield*/, exports.deleteAllItemsFromTable(items)];
                case 3:
                    numItemsDeleted = (_b.sent()).numItemsDeleted;
                    totalItemsDeleted += numItemsDeleted;
                    console.log("--- " + numItemsDeleted + " items deleted");
                    lastEvaluatedKey = lek;
                    _b.label = 4;
                case 4:
                    if (!!lastEvaluatedKey) return [3 /*break*/, 1];
                    _b.label = 5;
                case 5:
                    console.log("Done!");
                    console.log(totalItemsFetched + " items total fetched");
                    console.log(totalItemsDeleted + " items total deleted");
                    return [2 /*return*/];
            }
        });
    });
}
letsGo();
