namespace BlotterGen;

struct Trade
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
