namespace BlotterGen;

internal struct Transaction
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

    public static DateTime ToDate(long pxDate)
    {
        return new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddSeconds(pxDate).ToLocalTime();
    }
}