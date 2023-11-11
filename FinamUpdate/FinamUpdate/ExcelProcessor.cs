using Microsoft.Office.Interop.Excel;
using TradingTools;
using Excel = Microsoft.Office.Interop.Excel;

namespace PASUpdate;

internal class ExcelProcessor
{
    Excel.Application excel = null;
    Excel.Workbook workbook = null;

    void Attach(string fileName)
    {
        if (!File.Exists(fileName))
            throw new Exception("Excel File does not exists");
        excel = ExcelTools.AttachToApplication();
        workbook = ExcelTools.AttachToWorkbook(excel, fileName);

        excel.Visible = true;
        workbook.Activate();
    }

    public ExcelProcessor(string xlsx)
    {
        Attach(xlsx);
    }

    public struct Data
    {
        public DateTime lastDate;
        public int lastRow;
    }

    Dictionary<string, Data> sheetsData = new Dictionary<string, Data>();

    public Dictionary<string, Data> TicketsList => GetTicketsList();

    public Dictionary<string, Data> GetTicketsList(bool forse = false)
    {
        if (forse || sheetsData.Count == 0)
        {
            string[] ignore = { PortfolioSheetName, TotalSheetName, DataSheetName };

            sheetsData.Clear();

            foreach (Excel.Worksheet sheet in workbook.Sheets)
            {
                if (ignore.Contains(sheet.Name))
                    continue;

                sheetsData.Add(sheet.Name, new Data());
            }
            sheetsData.Add(TotalSheetName, new Data());
        }


        return sheetsData;
    }


    public Data GetTicketInfo(string cn)
    {
        Data data = sheetsData[cn];
        Excel.Worksheet sheet = workbook.Sheets[cn];

        int i = 5;

        while (true)
        {
            var ii = sheet.Cells[i, 2].Value;
            if (ii == null || !(ii is DateTime))
                break;
            ++i;
        }

        if (i > 5)
        {
            data.lastDate = sheet.Cells[i - 1, 2].Value;
            data.lastRow = i - 1;
        }
        sheetsData[cn] = data;
        return data;
    }

    QuotesProvider provider = new Finam();

    const string TotalSheetName = "Итог";
    const string PortfolioSheetName = "Портфель";
    const string DataSheetName = "Данные";

    DateTime BeginDate = new DateTime(2006, 01, 01);

    public void Process(string cn)
    {
        //excel.Interactive = false;
        bool retry = true;

        do
        {
            try
            {
                _Process(cn);
                retry = false;
            }
            catch (Exception ex)
            {
                if (ex.Message == "0x800AC472")
                    System.Threading.Thread.Sleep(1000);
                else
                    throw;
            }
        } while (retry);

        //excel.Interactive = true;
    }
    void _Process(string cn)
    {
        var sheetData = sheetsData[cn];
        Worksheet sheet = workbook.Sheets[cn];
        ListObject table = sheet.ListObjects[cn];
        Excel.Range range = table.Range;

        Dictionary<DateTime, QuotesProvider.Data>? quotes = null;
        if (cn != TotalSheetName)
            quotes = provider.Load(cn, sheetData.lastDate, DateTime.Now.Date);

        while (!excel.Ready) ;

        // расширим диапазон
        int addToRange = (DateTime.Now.Date.Year - BeginDate.Year) * 12 + (DateTime.Now.Date.Month - BeginDate.Month) + 1 - table.DataBodyRange.Rows.Count;

        if (addToRange > 0)
        {
            sheet.Range[$"{sheetData.lastRow + 1}:{sheetData.lastRow + addToRange}"].Insert(XlInsertShiftDirection.xlShiftDown);
            table.Resize(range.Resize[range.Rows.Count + addToRange, range.Columns.Count]);
        }

        while (!excel.Ready) ;

        // заполним данные (пока в координатах листа, а не таблицы)
        int addNeeded = (DateTime.Now.Date.Year - sheetData.lastDate.Year) * 12 + (DateTime.Now.Date.Month - sheetData.lastDate.Month);

        for (int i = sheetData.lastRow; i <= sheetData.lastRow + addNeeded; ++i)
        {
            if (i > sheetData.lastRow)
                sheet.Rows[i - 1].Copy(sheet.Rows[i]);

            DateTime dateKey = sheetData.lastDate.AddMonths(i - sheetData.lastRow);
            sheet.Cells[i, 2] = dateKey;

            if (quotes != null)
            {
                QuotesProvider.Data data = quotes[dateKey];
                sheet.Cells[i, 3] = data.open;
                sheet.Cells[i, 4] = data.high;
                sheet.Cells[i, 5] = data.low;
                sheet.Cells[i, 6] = data.close;
            }
        }        
    }
}
