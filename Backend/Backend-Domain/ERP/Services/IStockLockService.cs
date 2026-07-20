namespace Backend.Domain.ERP.Services;

public interface IStockLockService
{
    Task<bool> AcquireLockAsync(string lockKey, TimeSpan expiry);
    Task ReleaseLockAsync(string lockKey);
}
