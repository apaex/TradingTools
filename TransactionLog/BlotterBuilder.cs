namespace BlotterGen;

internal class BlotterBuilder
{
    List<Trade> blotter = new();

    public void Add(Transaction transaction)
    {
        int openTradeIndex = blotter.FindIndex(t => 
                (t.account == transaction.account)
                && (t.class_code == transaction.class_code)
                && (t.sec_code == transaction.sec_code) 
                && (t.qty_open != -t.qty_close));

        if (openTradeIndex < 0)
        {
            blotter.Add(new Trade
            {
                datetime = Transaction.ToDate(transaction.datetime),
                account = transaction.account,
                class_code = transaction.class_code,
                sec_code = transaction.sec_code,
            });
            openTradeIndex = blotter.Count - 1;
        }

        long qty = transaction.qty;
        var ot = blotter[openTradeIndex];

        if (ot.qty_open == 0 || (Math.Sign(qty) == Math.Sign(ot.qty_open)))
        {
            ot.qty_open += qty;
            ot.summ_open += transaction.summ;
            ot.exchange_comission += transaction.exchange_comission;
            ot.broker_comission += transaction.broker_comission;
            blotter[openTradeIndex] = ot;
        }
        else
        {
            long q = (ot.qty_close + qty != -ot.qty_open) ? -(ot.qty_open + ot.qty_close) : qty;

            ot.qty_close += q;
            ot.summ_close += transaction.summ / qty * q;
            blotter[openTradeIndex] = ot;

            if (q != qty)
            {
                q = qty - q;
                transaction.qty = q;
                transaction.summ /= qty / q;
                transaction.exchange_comission /= qty / q;
                transaction.broker_comission /= qty / q;
                Add(transaction);
            }
        }
    }


    public void WriteCSV(string filename)
    {
        StreamWriter csv = new StreamWriter(filename);

        List<string> row = new();

        var props = typeof(Trade).GetFields();

        foreach (var prop in props)
             row.Add(prop.Name); 

        csv.WriteLine(string.Join(";", row));


        foreach (Trade trade in blotter) 
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
