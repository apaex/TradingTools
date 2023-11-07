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


        Dictionary<string, int> quote_ids = new Dictionary<string, int>
        {
            { "AFLT", 29 },
            { "VTBR", 19043 },
            { "GAZP", 16842 },
            { "GMKN", 795 },
            { "LKOH", 8 },
            { "MTSS", 15523 },
            { "MGNT", 17086 },
            { "MOEX", 152798 },
            { "NLMK", 17046 },
            { "ROSN", 17273 },
            { "RTKM", 7 },
            { "HYDR", 20266 },
            { "SBER", 3 },
            { "CHMF", 16136 },
            { "SNGS", 4 },
            { "PLZL", 17123 },
            { "YNDX", 388383 },
            { "NVTK", 17370 },
            { "SNGSP", 13 },
            { "TATN", 825 },
            { "TRNFP", 1012 },
            { "ALRS", 81820 },
            { "SBERP", 23 },
            { "MTLR", 21018 },
            { "TCSG", 913710 },
            { "ASTR", 4577624 },
            { "MAGN", 16782 },
            { "HNFG", 4616877 },
            { "FLOT", 2101210 },
            { "POLY", 175924 },
            { "PHOR", 81114 },
            { "VKCO", 2901666 },
            { "RUAL", 414279 },
            { "OZON", 2179435 },
            { "SOFL", 4553966 },
            { "SMLT", 2135775 },
            { "SIBN", 2 },
            { "FIVE", 491944 },
            { "IRAO", 20516 },
            { "AFKS", 19715 },
            { "BSPB", 20066 },
            { "NMTP", 19629 },
            { "POSI", 2907747 },
            { "BELU", 19651 },
            { "FESH", 20708 },
            { "RNFT", 465236 },
            { "TRMK", 18441 },
            { "BANEP", 81758 },
            { "SGZH", 2477992 },
            { "CBOM", 420694 },
            { "RASP", 17713 },
            { "FEES", 20509 },
            { "ROLO", 181316 },
            { "TATNP", 826 },
            { "UWGN", 2896447 },
            { "UPRO", 18584 },
            { "AGRO", 399716 },
            { "PIKK", 18654 },
            { "SELG", 81360 },
            { "SPBE", 2868452 },
            { "GLTR", 2134426 },
            { "MSNG", 6 },
            { "TGKA", 18382 },
            { "DSKY", 473181 },
            { "UNAC", 22843 },
            { "SVAV", 16080 },
            { "MTLRP", 80745 },
            { "KMAZ", 15544 },
            { "LQDT", 3728099 },
            { "IRKT", 15547 },
            { "OGKB", 18684 },
            { "ENPG", 929597 },
            { "GTRK", 488918 },
            { "AQUA", 35238 },
            { "GECO", 4206126 },
            { "AKRN", 17564 },
            { "LIFE", 74584 },
            { "ABIO", 4498995 },
            { "BLNG", 21078 },
            { "AMEZ", 20702 },
            { "WUSH", 3994860 },
            { "FIXP", 2388781 },
            { "LSRG", 19736 },
            { "MVID", 19737 },
            { "BANE", 81757 },
            { "TTLK", 18371 },
            { "NKHP", 450432 },
            { "RTKMP", 15 },
            { "CARM", 4439728 },
            { "LSNG", 31 },
            { "ABRD", 82460 },
            { "QIWI", 181610 },
            { "VSMO", 15965 },
            { "MSTT", 74549 },
            { "ELFV", 4164144 },
            { "LSNGP", 542 },
            { "LNZLP", 22094 },
            { "MRKP", 20107 },
            { "APTK", 13855 },
            { "GCHE", 20125 },
            { "KZOS", 81856 },
            { "KZOSP", 81857 },
            { "LNZL", 21004 },
            { "RENI", 2819863 },
            { "HHRU", 2077391 },
            { "KROT", 510 },
            { "NKNC", 20100 },
            { "DVEC", 19724 },
            { "MRKC", 20235 },
            { "TGKN", 18176 },
            { "MGTSP", 12983 },
            { "ETLN", 928412 },
            { "MDMG", 2152359 },
            { "TGKB", 17597 },
            { "RKKE", 20321 },
            { "MSRS", 16917 },
            { "KAZT", 81941 },
            { "KLSB", 16329 },
            { "SFIN", 491359 },
            { "NSVZ", 81929 },
            { "MRKZ", 20309 },
            { "NKNCP", 20101 },
            { "PRFN", 4465201 },
            { "CNTLP", 81575 },
            { "AKMM", 3713632 },
            { "CHMK", 21001 },
            { "MRKV", 20286 },
            { "CNTL", 21002 },
            { "VRSB", 16546 },
            { "LENT", 2883636 },
            { "INGR", 1667866 },
            { "KRKNP", 81892 },
            { "YAKG", 81917 },
            { "PMSB", 16908 },
            { "MRKS", 20346 },
            { "MRKU", 20402 },
            { "MRKY", 20681 },
            { "SBMM", 2775291 },
            { "UNKL", 82493 },
            { "ROSB", 16866 },
            { "OKEY", 2216507 },
            { "TRUR", 924987 },
            { "KAZTP", 81942 },
            { "KUBE", 522 },
            { "TGKBP", 18189 },
            { "PMSBP", 16909 },
            { "ZVEZ", 82001 },
            { "MRKK", 20412 },
            { "RGSS", 181934 },
            { "NFAZ", 81287 },
            { "EELT", 487432 },
            { "ELTZ", 81934 },
            { "IGST", 81885 },
            { "USBN", 81953 },
            { "GAZA", 81997 },
            { "DIOD", 35363 },
            { "NAUK", 81992 },
            { "NKSH", 81947 },
            { "KCHE", 20030 },
            { "HIMCP", 81940 },
            { "VLHZ", 17257 },
            { "RUSI", 81786 },
            { "SLEN", 473000 },
            { "TNSE", 420644 },
            { "UTAR", 15522 },
            { "ROST", 20637 },
            { "LVHK", 152517 },
            { "BRZL", 81901 },
            { "KROTP", 511 },
            { "KUZB", 83165 },
            { "RBCM", 74779 },
            { "TUZA", 20716 },
            { "MAGE", 74562 },
            { "LPSB", 4483547 },
            { "PAZA", 81896 },
            { "ZILL", 81918 },
            { "IGSTP", 81887 },
            { "RZSB", 16455 },
            { "KMEZ", 22525 },
            { "VGSB", 16456 },
            { "YKEN", 81766 },
            { "RTSB", 16783 },
            { "VRSBP", 16547 },
            { "STSBP", 20088 },
            { "UKUZ", 20717 },
            { "OMZZP", 15844 },
            { "KBSB", 19916 },
            { "ARSA", 19915 },
            { "CHKZ", 21000 },
            { "SAGO", 445 },
            { "MISBP", 16331 },
            { "KRSB", 20912 },
            { "RDRB", 181755 },
            { "MFGSP", 51 },
            { "ASSB", 16452 },
            { "RTSBP", 16784 },
            { "MGTS", 12984 },
            { "GEMA", 901174 },
            { "STSB", 20087 },
            { "TASB", 16265 },
            { "MAGEP", 74563 },
            { "MISB", 16330 },
            { "WTCM", 19095 },
            { "KRKOP", 81906 },
            { "MFGS", 30 },
            { "VGSBP", 16457 },
            { "TMOS", 2031756 },
            { "YRSB", 16342 },
            { "BISVP", 35243 },
            { "KTSB", 16284 },
            { "TORS", 16797 },
            { "JNOSP", 15723 },
            { "DZRD", 74744 },
            { "SAREP", 24 },
            { "VSYDP", 83252 },
            { "YKENP", 81769 },
            { "GAZAP", 81998 },
            { "WTCMP", 19096 },
            { "KRSBP", 20913 },
            { "TGLD", 2703844 },
            { "NNSB", 16615 },
            { "VJGZP", 81955 },
            { "YRSBP", 16343 },
            { "KCHEP", 20498 },
            { "PRMB", 80818 },
            { "HMSG", 2534843 },
            { "KOGK", 20710 },
            { "SAGOP", 70 },
            { "NNSBP", 16616 },
            { "TORSP", 16798 },
            { "KGKCP", 152350 },
            { "JNOS", 15722 },
            { "TASBP", 16266 },
            { "KTSBP", 16285 },
            { "TBRU", 2646025 },
            { "URKZ", 82611 },
            { "KGKC", 83261 },
            { "SVET", 2284141 },
            { "KRKN", 81891 },
            { "AVAN", 82843 },
            { "AKMB", 1822421 },
            { "RU000A0JT4S1", 3811557 },
            { "SBRB", 909136 },
            { "ORUP", 4282467 },
            { "OBLG", 3728100 },
            { "SBMX", 497675 },
            { "SARE", 11 },
            { "RU000A105328", 4164147 },
            { "MRSB", 16359 },
            { "VSYD", 83251 },
            { "DZRDP", 74745 },
            { "EQMX", 3728096 },
            { "RU000A101UY0", 2008079 },
            { "RU000A102P67", 2854525 },
            { "KZIZP", 4271196 },
            { "SLAV", 4450396 },
            { "RU000A105TU1", 4263989 },
            { "GOLD", 3728098 },
            { "RU000A1068X9", 4473035 },
            { "RU000A0JP799", 18523 },
            { "SBGB", 571768 },
            { "CIAN", 2839864 },
            { "VJGZ", 81954 },
            { "NOMPP", 4271198 },
            { "GEMC", 2655082 },
            { "AKME", 2222293 },
            { "ZILLP", 4450397 },
            { "RU000A1007R9", 2853574 },
            { "OBNEP", 4271201 },
            { "NTZL", 4271199 },
            { "INGO", 2673171 },
            { "RU000A0JP773", 2714338 },
            { "RU000A0ZZCD8", 499199 },
            { "RU000A104KU3", 3905349 },
            { "RCHY", 2673173 },
            { "BSPBP", 2314364 },
            { "RCMB", 2127225 },
            { "SUGB", 2077397 },
            { "AKGD", 2913471 },
            { "SBGD", 3832065 },
            { "RTGZ", 152397 },
            { "RU000A0JVHY6", 496833 },
            { "RCMX", 1822136 },
            { "BOND", 3810748 },
            { "RU000A1034U7", 2703843 },
            { "KZIZ", 4271195 },
            { "NOMP", 4271197 },
            { "GRNT", 4282466 },
            { "TMON", 4454969 },
            { "RU000A102N77", 2341019 },
            { "RU000A102Q33", 2854534 },
            { "SBSC", 4573969 },
            { "SBCS", 2582568 },
            { "RU000A1022Z1", 2483115 },
            { "SBCN", 4038267 },
            { "RU000A101NK4", 1974544 },
            { "RSHU", 3869301 },
            { "VEON-RX", 2877923 },
            { "RU000A0JPGC6", 19611 },
            { "RU000A0ZZ5R2", 499245 },
        };

        string token = "HFeTY2ak8XCUxlaAYDVxwSVlhVDUwxXkpJL31LJkg6fk5mHVBCHTdCc001Xm0fdRYKPXNRHUU0HUVPQAQdPCFeAxhhBh9YfkcKaRdJTgkaSWNRXA0lBxMTQzgnRRsSHUUxXwgVXi4zXxwwYl5rdGJkQD4GRAgUHlVIVRkIIAghCUwRK1FFHUU0HU9VSQRcRD8WZ3U5fzQwL0UrSQUufy4NNTlTEjJIP1Y6";

        const string url = "https://export.finam.ru/export.csv";

        public void Load(DateTime from, DateTime to)
        {
            int m = 1;
            string cn = "AFLT";
            Period p = Period.Month;

            Dictionary<string, string> data = new Dictionary<string, string>();         
            data["market"] = m.ToString();
            data["em"] = quote_ids[cn].ToString();
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

            string urlRequest = url + "?" + string.Join('&', data.Select(kvp => kvp.Key + "=" + kvp.Value));

            using (var http = new WebClient())
            {
                http.DownloadFile(urlRequest, "out.csv");
            }
        }
    }

}
