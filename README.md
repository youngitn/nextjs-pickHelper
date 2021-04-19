This is a starter template for [Learn Next.js](https://nextjs.org/learn).

# Pick-Hepler

此為撿貨輔助平台,前端react部分.

1. 嘗試使用NEXT.JS,不須透過nginx即可proxy port (server.js).
2. 整合狀態管理框架 redux
3. 
3.1 掃出通單條碼後,取得待撿貨出貨清單,
3.2 user根據待撿貨清單資訊找到儲位後,掃包裝上QR CODE進行撿貨動作,帶出該物料庫存資訊.
3.3 比對出通單中物料批號,庫存中如有符合批號者則自動扣除出貨數量;無批號則由撿貨人員手動操作.
3.3 資料的操作處理皆於前端完成,最後送出至ERP web service 產出貨單.

