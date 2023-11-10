using static QuotesUpdate.ExcelProcessor;

namespace QuotesUpdate
{
    public partial class Form1 : Form
    {
        ExcelProcessor proc = new ExcelProcessor(Settings.Default.InputFile);
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            button1_Click(sender, e);
        }

        private void button1_Click(object sender, EventArgs e)
        {
            listView1.Items.Clear();

            foreach (var quote in proc.TicketsList)
                listView1.Items.Add(quote.Key, quote.Key, -1);
        }

        private void button2_Click(object sender, EventArgs e)
        {
            foreach (var quote in proc.TicketsList)
            {
                try
                {
                    ExcelProcessor.Data ticketInfo = proc.GetTicketInfo(quote.Key);
                    listView1.Items[quote.Key].SubItems.Add(ticketInfo.lastDate.ToString());
                }
                catch (Exception ex) { }


                Application.DoEvents();
            }
        }

        private void button3_Click(object sender, EventArgs e)
        {
            foreach (var quote in proc.TicketsList)
            {
                string status = "OK";
                try
                {
                    proc.Process(quote.Key);
                }
                catch (Exception ex) { status = ex.Message; }

                listView1.Items[quote.Key].SubItems.Add(status);

                Application.DoEvents();
                break;
            }
        }
    }
}