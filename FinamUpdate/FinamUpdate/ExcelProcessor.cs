using Microsoft.Office.Interop.Excel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using Excel = Microsoft.Office.Interop.Excel;

namespace FinamUpdate
{
    internal class ExcelProcessor
    {
        Excel.Application excel = null;
        Excel.Workbook workbook = null;

        void Attach(string fileName)
        {
            if (!File.Exists(fileName))
                throw new Exception("Excel File does not exists");
            excel = AttachToApplication();
            workbook = AttachToWorkbook(fileName);

            excel.Visible = true;
            workbook.Activate();
        }

        Excel.Application AttachToApplication()
        {
            try
            {
                return (Excel.Application)Marshal2.GetActiveObject("Excel.Application");
            }
            catch (System.Runtime.InteropServices.COMException)
            {
            }

            return new Excel.Application();           
        }

        Excel.Workbook AttachToWorkbook(string fileName)
        { 
            foreach (Excel.Workbook wb in excel.Workbooks)
                if (wb.FullName == fileName)
                    return wb;

            return excel.Workbooks.Open(fileName, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing);
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
           

        }
    }
}
