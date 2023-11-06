using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;

namespace FinamUpdate;

public class ExcelTest
{
    public Excel.Application excel = null;
    public Excel.Workbook workbook = null;
    public Excel.Worksheet worksheet = null;


    public bool GetXlSheet(string xlFileName,
                                    string xlSheetName)
    {
        try
        {
            if (!File.Exists(xlFileName))
            {
                MessageBox.Show("Excel File does not exists!");
                return false;
            }

            excel = (Excel.Application)Marshal2.GetActiveObject("Excel.Application");
            foreach (Excel.Workbook wb in excel.Workbooks)
            {
                if (wb.FullName == xlFileName)
                {
                    if (!workbook
                        .Sheets
                        .Cast<Excel.Worksheet>()
                        .Select(s => s.Name)
                        .Contains(xlSheetName))
                    {
                        MessageBox.Show("Sheet name does not exist in the Excel workbook!");
                        return false;
                    }
                    worksheet = workbook.Sheets[xlSheetName];
                }
            }
        }
        catch (Exception ex)
        {
            // catch errors
        }
    }
}