namespace ProductManagement.Application.Common.Dto;

public record OptionDto(Guid Id, string Name, decimal PriceModifier, bool? IsAvailable);
