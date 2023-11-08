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

    Dictionary<string, Data> quotes = new Dictionary<string, Data>();
    

    public Dictionary<string, Data> GetQuotes()
    {
        string[] ignore = { "Портфель", "Итог", "Данные" };

        quotes.Clear();

        foreach (Excel.Worksheet sheet in workbook.Sheets)
        {
            if (ignore.Contains(sheet.Name))
                continue;

   
            Data data = new Data() { lastDate = new DateTime(2006,01,01), lastRow = 5 } ;

            int i = 5;

            while(true) 
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
            quotes.Add(sheet.Name, data);

            break;
        }

        return quotes;
    }


    public void Process()
    {
        QuotesProvider provider = new Finam();
        
        foreach (var quote in quotes)
        {
            var datas = provider.Load(quote.Key, quote.Value.lastDate, DateTime.Now.Date);

            Worksheet sheet = workbook.Sheets[quote.Key];


            int addNeeded = (DateTime.Now.Date.Year - quote.Value.lastDate.Year) * 12 + (DateTime.Now.Date.Month - quote.Value.lastDate.Month);
            
            for (int i = quote.Value.lastRow; i <= quote.Value.lastRow + addNeeded; ++i)
            {
                if (i > quote.Value.lastRow)
                {
                    sheet.Rows[i].Insert(XlInsertShiftDirection.xlShiftDown);
                    sheet.Rows[i - 1].Copy(sheet.Rows[i]);
                }

                DateTime dateKey = quote.Value.lastDate.AddMonths(i - quote.Value.lastRow);
                QuotesProvider.Data data = datas[dateKey];

                sheet.Cells[i, 2] = dateKey;
                sheet.Cells[i, 3] = data.open;
                sheet.Cells[i, 4] = data.high;
                sheet.Cells[i, 5] = data.low;
                sheet.Cells[i, 6] = data.close;
            }

            break;
        }
    }
}
