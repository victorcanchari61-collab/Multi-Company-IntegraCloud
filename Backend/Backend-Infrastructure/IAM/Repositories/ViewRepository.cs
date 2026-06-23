using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class ViewRepository(IamDbContext context)
    : BaseRepository<View>(context), IViewRepository;
