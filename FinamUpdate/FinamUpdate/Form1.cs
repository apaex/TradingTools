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
            proc.Process();

            listView1.Items.Clear();
            Dictionary<string, Data> quotes = proc.GetQuotes();

            foreach (var quote in quotes)
            {
                listView1.Items.Add(new ListViewItem(new[] { quote.Key, quote.Value.lastRow.ToString(), quote.Value.lastDate.ToString() }));          
            }
        }
    }
}