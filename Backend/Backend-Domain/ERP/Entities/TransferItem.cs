using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class TransferItem : Entity
{
    public Guid TransferId { get; private set; }
    public Transfer? Transfer { get; private set; }
    public Guid ProductId { get; private set; }
    public Product? Product { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal? UnitCost { get; private set; }

    private TransferItem() { }

    public TransferItem(Guid id, Guid transferId, Guid productId, decimal quantity, decimal? unitCost) : base(id)
    {
        TransferId = transferId;
        ProductId = productId;
        Quantity = quantity;
        UnitCost = unitCost;
    }
}
