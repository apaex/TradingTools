﻿namespace TradingTools;

internal abstract class QuotesProvider
{
    public enum Period
    {
        Tics = 1,
        Min1,
        Min5,
        Min10,
        Min15,
        Min30,
        Hour,
        Day,
        Week,
        Month
    }

    public struct Data
    {
        public string ticker;
        public string period;
        public DateTime date;
        public double open, high, low, close, volume;
    }
    public abstract Dictionary<DateTime, Data> Load(string cn, DateTime from, DateTime to, Period p = Period.Month);

}
