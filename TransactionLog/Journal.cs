using System.Diagnostics.SymbolStore;

namespace JournalGen;

internal class Journal
{
    public struct Trade
    {
        public DateTime datetime_open;
        public string account;
        public string class_code;
        public string sec_code;

        public string order_num_open;
        public long qty_open;
        public double summ_open;
        public double exchange_comission_open;
        public double broker_comission_open;

        public DateTime datetime_close;
        public string order_num_close;
        public long qty_close;
        public double summ_close;
        public double exchange_comission_close;
        public double broker_comission_close;

        public void AddOpenOrderNum(long order_num)
        {
            order_num_open += order_num.ToString() + "|";
        }

        public void AddCloseOrderNum(long order_num)
        {
            order_num_close += order_num.ToString() + "|";
        }    
    }


    List<Trade> journal = new();

    public void Add(Transaction transaction)
    {
        int openTradeIndex = journal.FindIndex(t => 
                (t.account == transaction.account)
                && (t.class_code == transaction.class_code)
                && (t.sec_code == transaction.sec_code) 
                && (t.qty_open != -t.qty_close));

        if (openTradeIndex < 0)
        {
            journal.Add(new Trade
            {
                datetime_open = Transaction.ToDate(transaction.datetime),
                account = transaction.account,
                class_code = transaction.class_code,
                sec_code = transaction.sec_code,
            });
            openTradeIndex = journal.Count - 1;
        }

        long qty = transaction.qty;
        var ot = journal[openTradeIndex];

        if (ot.qty_open == 0 || (Math.Sign(qty) == Math.Sign(ot.qty_open)))
        {
            ot.qty_open += qty;
            ot.summ_open += transaction.summ;
            ot.exchange_comission_open += transaction.exchange_comission;
            ot.broker_comission_open += transaction.broker_comission;
            ot.AddOpenOrderNum(transaction.order_num);

            journal[openTradeIndex] = ot;
        }
        else
        {
            long q = (Math.Abs(ot.qty_close + qty) > Math.Abs(ot.qty_open)) ? -(ot.qty_open + ot.qty_close) : qty;
            
            if (Math.Abs(qty) < Math.Abs(q))
                throw new Exception("Данные в БД некорректны");

            ot.qty_close += q;
            ot.summ_close += transaction.summ / qty * q;
            ot.exchange_comission_close += transaction.exchange_comission;
            ot.broker_comission_close += transaction.broker_comission;
            ot.datetime_close = Transaction.ToDate(transaction.datetime);
            ot.AddCloseOrderNum(transaction.order_num);

            journal[openTradeIndex] = ot;

            if (q != qty)
            {
                q = qty - q;
                Transaction tt = new Transaction
                {
                    order_num = transaction.order_num,
                    datetime = transaction.datetime,
                    account = transaction.account,
                    class_code = transaction.class_code,
                    sec_code = transaction.sec_code,
                    qty = q,
                    summ = transaction.summ / qty * q,
                    exchange_comission = transaction.exchange_comission / qty * q,
                    broker_comission = transaction.broker_comission / qty * q,
                };
                Add(tt);
            }
        }
    }

    static Dictionary<string, string> Map(Trade trade)
    {
        return new Dictionary<string, string>
        {
            { "date", trade.datetime_open.Date.ToString() },
            { "time", trade.datetime_open.TimeOfDay.ToString() },
            { "sec_code", trade.sec_code },
            { "qty_open", trade.qty_open.ToString() },
            { "sum_open", trade.summ_open.ToString() },
            { "exchange_comission", (trade.exchange_comission_open + trade.exchange_comission_close).ToString() },
            { "broker_comission", (trade.broker_comission_open + trade.broker_comission_close).ToString() },
            //{ "datetime_close", trade.datetime_close.ToString() },
            { "qty_close", trade.qty_close.ToString() },
            { "sum_close", trade.summ_close.ToString() },
        };

    }

    public void WriteCSVTemplate(string filename)
    {
        StreamWriter csv = new StreamWriter(filename);

        bool header = true;

        foreach (Trade trade in journal)
        {
            if (header)
            {        
                var headers = Map(trade).Keys;
                csv.WriteLine(string.Join(";", headers));
                header = false;
            }

            var values = Map(trade).Values;
            csv.WriteLine(string.Join(";", values));
        }

        csv.Close();
    }
    public void WriteCSV(string filename)
    {
        StreamWriter csv = new StreamWriter(filename);

        List<string> row = new();

        var props = typeof(Trade).GetFields();

        foreach (var prop in props)
             row.Add(prop.Name); 

        csv.WriteLine(string.Join(";", row));


        foreach (Trade trade in journal) 
        {
            row = new();

            foreach (var prop in props)
            {
                if (prop.FieldType == typeof(string))
                    row.Add( "\"" + prop.GetValue(trade) + "\"");
                else
                    row.Add(prop.GetValue(trade).ToString());
            }

            csv.WriteLine(string.Join(";", row));
        }
        
        csv.Close();
    }
};
