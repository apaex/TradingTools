using System;
using System.Collections.Generic;
using System.Linq;
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
            workbook = AttachToWorkbook(excel, fileName);

            excel.Visible = true;
            workbook.Activate();
        }

        static Excel.Application AttachToApplication()
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

        static Excel.Workbook AttachToWorkbook(Excel.Application excel, string fileName)
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

        public void Process()
        {

        }
    }
}
