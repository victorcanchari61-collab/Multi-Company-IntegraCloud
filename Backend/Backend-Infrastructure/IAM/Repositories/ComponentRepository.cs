using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class ComponentRepository(IamDbContext context)
    : BaseRepository<Component>(context), IComponentRepository;
