namespace TransactionLog;
internal struct Trade
{
    public long order_num;
    public long datetime;
    public string account;
    public string class_code;
    public string sec_code;

    public long qty;
    public double summ;
    public double exchange_comission;
    public double broker_comission;
}

internal class TransactionLogBuilder
{
    struct TradeLog
    {
        public DateTime datetime;
        public string account;
        public string class_code;
        public string sec_code;

        public long qty_open;
        public double summ_open;

        public double exchange_comission;
        public double broker_comission;

        public long qty_close;
        public double summ_close;
    }


    List<TradeLog> trades = new();

    static DateTime ToDate(long pxDate)
    {
        return new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddSeconds(pxDate).ToLocalTime();
    }

    public void Add(Trade trade)
    {
        int index = trades.FindIndex(t => 
                (t.account == trade.account)
                && (t.class_code == trade.class_code)
                && (t.sec_code == trade.sec_code) 
                && (t.qty_open != -t.qty_close));

        if (index == -1)
        {
            trades.Add(new TradeLog
            {
                datetime = ToDate(trade.datetime),
                account = trade.account,
                class_code = trade.class_code,
                sec_code = trade.sec_code,
            });
            index = trades.Count - 1;
        }

        long qty = trade.qty;
        var current = trades[index];

        if (current.qty_open == 0 || (Math.Sign(qty) == Math.Sign(current.qty_open)))
        {
            current.qty_open += qty;
            current.summ_open += trade.summ;
            current.exchange_comission += trade.exchange_comission;
            current.broker_comission += trade.broker_comission;
            trades[index] = current;
        }
        else
        {
            long qty_ = (Math.Abs(current.qty_close + qty) > Math.Abs(current.qty_open)) ? -(current.qty_open + current.qty_close) : qty;

            current.qty_close += qty_;
            current.summ_close += trade.summ / qty * qty_;
            trades[index] = current;

            if (qty_ != qty)
            {
                qty_ = qty - qty_;
                trade.qty = qty_;
                trade.summ = trade.summ / qty * qty_;
                trade.exchange_comission = trade.exchange_comission / qty * qty_;
                trade.broker_comission = trade.broker_comission / qty * qty_;
                Add(trade);
            }
        }
    }


    public void WriteCSV(string filename)
    {
        StreamWriter csv = new StreamWriter(filename);

        List<string> row = new();

        var props = typeof(TradeLog).GetFields();

        foreach (var prop in props)
             row.Add(prop.Name); 

        csv.WriteLine(string.Join(";", row));


        foreach (TradeLog trade in trades) 
        {
            row = new();

            foreach (var prop in props)
            {
                row.Add( prop.GetValue(trade).ToString() ); 
            }

            csv.WriteLine(string.Join(";", row));
        }
        
        csv.Close();
    }
};
