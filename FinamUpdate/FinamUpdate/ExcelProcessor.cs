using Microsoft.Office.Interop.Excel;
using Excel = Microsoft.Office.Interop.Excel;

namespace QuotesUpdate;

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
        }

        sheetsData.Add(TotalSheetName, new Data());

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

    public void Process(string sheetName)
    {
        if (sheetName != TotalSheetName)
            ProcessQuery(sheetName);
        else
            ProcessTotal();
    }
    public void ProcessQuery(string cn)
    {
        var sheetData = sheetsData[cn];
        Worksheet sheet = workbook.Sheets[cn];
        ListObject table = sheet.ListObjects[cn];
        Excel.Range range = table.Range;

        var quotes = provider.Load(cn, sheetData.lastDate, DateTime.Now.Date);

        int addNeeded = (DateTime.Now.Date.Year - sheetData.lastDate.Year) * 12 + (DateTime.Now.Date.Month - sheetData.lastDate.Month);

        if (addNeeded > 0)
        {
            sheet.Range[$"{sheetData.lastRow + 1}:{sheetData.lastRow + addNeeded}"].Insert(XlInsertShiftDirection.xlShiftDown);
            table.Resize(range.Resize[range.Rows.Count + addNeeded, range.Columns.Count]);
        }

        for (int i = sheetData.lastRow; i <= sheetData.lastRow + addNeeded; ++i)
        {
            if (i > sheetData.lastRow)
                sheet.Rows[i - 1].Copy(sheet.Rows[i]);

            DateTime dateKey = sheetData.lastDate.AddMonths(i - sheetData.lastRow);
            QuotesProvider.Data data = quotes[dateKey];

            sheet.Cells[i, 2] = dateKey;
            sheet.Cells[i, 3] = data.open;
            sheet.Cells[i, 4] = data.high;
            sheet.Cells[i, 5] = data.low;
            sheet.Cells[i, 6] = data.close;
        }        
    }

    public void ProcessTotal()
    {
        string cn = TotalSheetName;
        var sheetData = sheetsData[cn];
        Worksheet sheet = workbook.Sheets[cn];
        ListObject table = sheet.ListObjects[cn];
        Excel.Range range = table.Range;


        int addNeeded = (DateTime.Now.Date.Year - sheetData.lastDate.Year) * 12 + (DateTime.Now.Date.Month - sheetData.lastDate.Month);

        if (addNeeded > 0)
        {
            sheet.Range[$"{sheetData.lastRow + 1}:{sheetData.lastRow + addNeeded}"].Insert(XlInsertShiftDirection.xlShiftDown);
            table.Resize(range.Resize[range.Rows.Count + addNeeded, range.Columns.Count]);
        }

        for (int i = sheetData.lastRow; i <= sheetData.lastRow + addNeeded; ++i)
        {
            if (i > sheetData.lastRow)
                sheet.Rows[i - 1].Copy(sheet.Rows[i]);

            DateTime dateKey = sheetData.lastDate.AddMonths(i - sheetData.lastRow);
            sheet.Cells[i, 2] = dateKey;
        }
    }
}
