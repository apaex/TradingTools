using Excel = Microsoft.Office.Interop.Excel;

namespace FinamUpdate;

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
        }

        return quotes;
    }


    public void Process()
    {
        QuotesProvider provider = new Finam();
        
        foreach (var quote in quotes)
        {
            provider.Load(quote.Key, quote.Value.lastDate, DateTime.Now.Date);
            //listView1.Items.Add(new ListViewItem(new[] { quote.Key, quote.Value.lastRow.ToString(), quote.Value.lastDate.ToString() }));

        }

        //Rows("217:217").Select
        //Selection.Copy
        //Rows("218:218").Select
        //Selection.Insert Shift:= xlDown

    }
}
