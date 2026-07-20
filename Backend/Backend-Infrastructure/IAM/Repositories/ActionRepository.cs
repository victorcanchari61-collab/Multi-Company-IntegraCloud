using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class ActionRepository(IamDbContext context)
    : BaseRepository<PermissionAction>(context), IActionRepository;
