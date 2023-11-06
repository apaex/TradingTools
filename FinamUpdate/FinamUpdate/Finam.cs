using Microsoft.VisualBasic.Logging;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.TaskbarClock;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.TextBox;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.ToolTip;

namespace FinamUpdate
{
    public class Finam
    {        
        public Finam() 
        {
        }

        enum Period
        {
            Tics = 1,
            Min1,
            Min5,
            Min10,
            Min15,
            Min30,
            Hour,
            Day,
            Week,
            Month
        }
        //Finam.IssuerProfile.Main.setMarkets([{ value: 631, title: 'Акции Германии'}, { value: 632, title: 'Акции Европы'}, { value: 200, title: 'МосБиржа топ'}, { value: 1, title: 'МосБиржа акции'}, { value: 14, title: 'МосБиржа фьючерсы'}, { value: 41, title: 'Курс рубля'}, { value: 45, title: 'МосБиржа валютный рынок'}, { value: 2, title: 'МосБиржа облигации'}, { value: 12, title: 'МосБиржа внесписочные облигации'}, { value: 29, title: 'МосБиржа пифы'}, { value: 515, title: 'Мосбиржа ETF'}, { value: 8, title: 'Расписки'}, { value: 519, title: 'Еврооблигации'}, { value: 517, title: 'Санкт-Петербургская биржа'}, { value: 6, title: 'Мировые Индексы'}, { value: 24, title: 'Товары'}, { value: 5, title: 'Мировые валюты'}, { value: 520, title: 'Криптовалюты'}, { value: 25, title: 'Акции США(BATS)'}, { value: 7, title: 'Фьючерсы США'}, { value: 27, title: 'Отрасли экономики США'}, { value: 26, title: 'Гособлигации США'}, { value: 28, title: 'ETF'}, { value: 30, title: 'Индексы мировой экономики'}, { value: 91, title: 'Российские индексы'}, { value: 3, title: 'РТС'}, { value: 20, title: 'Боард'}, { value: 10, title: 'РТС-GAZ'}, { value: 17, title: 'МосБиржа фьючерсы Архив'}, { value: 31, title: 'Сырье Архив'}, { value: 38, title: 'RTS Standard Архив'}, { value: 16, title: 'МосБиржа Архив'}, { value: 18, title: 'РТС Архив'}, { value: 9, title: 'СПФБ Архив'}, { value: 32, title: 'РТС-BOARD Архив'}, { value: 39, title: 'Расписки Архив'}, { value: 600, title: 'МосБиржа облигации архив'}, { value: 610, title: 'МосБиржа пифы Архив'}, { value: 620, title: 'Санкт-Петербургская биржа Архив'}, { value: 630, title: 'Еврооблигации Архив'}, { value: -1, title: 'Отрасли'}]);
        //Finam.IssuerProfile.Main.issue = {"quote": {"id": 18425, "code": "TGKJ", "fullUrl": "mmvb-arhiv/fortum", "title": "Фортум", "decp": 3, "testDriveEnabled": false, "market": {"id": 1, "title": "МосБиржа акции", "volumeEnabled": true},"info": {"decp": 3, "last": 22.3, "pchange": -5.15481, "change": -1.212, "bid": 22.25, "ask": 22.2, "open": 21.65, "high": 23.3, "low": 21.65, "close": 23.512, "volume": 177800, "date": "21.12.2012 18:44:44", "weekMin": null, "weekMax": null, "monthMin": null, "monthMax": null, "yearMin": null, "yearMax": null,"currency": "руб.","volumeCode": "шт."},"forum": null,"forumTitle": null,"linkedTitle": "&quot;Форвард Энерго&quot;", "linkedList": [{"id": 18425, "code": "TGKJ", "title": "Фортум", "decp": 3, "fullUrl": "mmvb-arhiv/fortum", "market": {"id": 1, "title": "МосБиржа акции", "volumeEnabled": true},"selected": true, "url": "/analysis/profile047F9/" }] },"company": { "id": 1577, "code": "TGKJ", "title": "&quot;Форвард Энерго&quot;", "titleFull": "Публичное акционерное общество &quot;Форвард Энерго&quot;", "capitalization": null, "capitalizationText": "", "infoExists": true, "intro": "", "siteUrl": null, "sector": { "id": 10, "title": "Электроэнергетика", "url": "/analysis/bundle0000A/", "sectorquote": "", "intro": "","ups": "12","downs": "35","cnt": "49",} }, "news": { "mix": { "quote": 18425, "url": null, }, "issue": { "quote": 18425, "url": "/quote/mmvb-arhiv/fortum/publications/?market=1", }, "mixed": { "quote": 18425, "url": "/profile/mmvb-arhiv/fortum/mixed/?market=1", }, "comments": { "quote": 18425, "url": "/profile/mmvb-arhiv/fortum/comments/?market=1", }, "dates": { "quote": 18425, "url": "/profile/mmvb-arhiv/fortum/dates/?market=1", }, "events": { "quote": 18425, "url": "/profile/mmvb-arhiv/fortum/events/?market=1", }, "secondary": { "quote": 18425, "url": "/profile/mmvb-arhiv/fortum/secondary/?market=1", }, "corporativeEvents": { "quote": 18425, "url": "/profile/mmvb-arhiv/fortum/corporate/?market=1", }, "blogsAndGraphs": { "quote": 18425, "url": null, "count": "0", "pageSize": 1, "pageNumber": 1, "pagesCount": 1} }};


        const string Url = "https://export.finam.ru/export.csv";

        public void Load(DateTime from, DateTime to)
        {
            int m = 1;
            int em = 29;
            string token = "HFeTY2ak8XCUxlaAYDVxwSVlhVDUwxXkpJL31LJkg6fk5mHVBCHTdCc001Xm0fdRYKPXNRHUU0HUVPQAQdPCFeAxhhBh9YfkcKaRdJTgkaSWNRXA0lBxMTQzgnRRsSHUUxXwgVXi4zXxwwYl5rdGJkQD4GRAgUHlVIVRkIIAghCUwRK1FFHUU0HU9VSQRcRD8WZ3U5fzQwL0UrSQUufy4NNTlTEjJIP1Y6";
            string cn = "AFLT";
            Period p = Period.Month;

            Dictionary<string, string> data = new Dictionary<string, string>();         
            data["market"] = m.ToString();
            data["em"] = em.ToString();
            data["token"] = token;
            data["code"] = cn;
            data["apply"] = "1";
            data["df"] = from.Day.ToString();
            data["mf"] = (from.Month-1).ToString();
            data["yf"] = from.Year.ToString();
            data["from"] = from.ToString("dd.MM.yyyy");
            data["dt"] = to.Day.ToString();
            data["mt"] = (to.Month-1).ToString();
            data["yt"] = to.Year.ToString();
            data["to"] = to.ToString("dd.MM.yyyy");
            data["p"] = Convert.ToInt32(p).ToString();
            data["f"] = "export";
            data["e"] = ".csv";
            data["cn"] = cn;        //Имя контракта
            data["dtf"] = "1";      //ггггммдд
            data["tmf"] = "1";      //ччммсс
            data["MSOR"] = "1";     //окончания свечи
            data["mstime"] = "on";  //московское
            data["mstimever"] = "1";
            data["sep"] = "3";      //запятая (,)
            data["sep2"] = "1";     //нет
            data["datf"] = "1";     //TICKER, PER, DATE, TIME, OPEN, HIGH, LOW, CLOSE, VOL
            data["at"] = "";       //Добавить заголовок файла
            data["fsp"] = "";       //Заполнять периоды без сделок

            string urlRequest = Url + "?" + string.Join('&', data.Select(kvp => kvp.Key + "=" + kvp.Value));

            using (var http = new WebClient())
            {
                http.DownloadFile(urlRequest, "out.csv");
            }
        }
    }

}
