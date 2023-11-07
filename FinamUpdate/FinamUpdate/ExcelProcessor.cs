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

        List<string> quotes = new List<string>();
        

        public List<string> GetQuotes()
        {
            string[] ignore = { "Портфель", "Итог", "Данные" };

            quotes.Clear();

            foreach (Excel.Worksheet sheet in workbook.Sheets)
            {
                if (!ignore.Contains(sheet.Name))
                    quotes.Add(sheet.Name);
            }

            return quotes;
        }


        public void Process()
        {
            List<string> quotes = GetQuotes();


        }
    }
}
