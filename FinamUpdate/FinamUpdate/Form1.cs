using static QuotesUpdate.ExcelProcessor;

namespace QuotesUpdate
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
        }

        private void button1_Click(object sender, EventArgs e)
        {
            ExcelProcessor proc = new ExcelProcessor(Settings.Default.InputFile);

            listView1.Items.Clear();
            Dictionary<string, Data> quotes = proc.GetQuotes();

            foreach (var quote in quotes)
            {
                listView1.Items.Add(new ListViewItem(new[] { quote.Key, quote.Value.lastDate.ToString(), quote.Value.lastRow.ToString() }));
            }
            
            Thread.Sleep(0);

            foreach (var quote in quotes)
            {
                string status = "OK";
                try
                {
                    proc.Process(quote.Key);
                }
                catch(Exception ex) { status = ex.Message; }


                //listView1.Items[quote.Key] = status;

                Thread.Sleep(0);
                break;
            }        
        }

        private void button2_Click(object sender, EventArgs e)
        {
            
        }
    }
}