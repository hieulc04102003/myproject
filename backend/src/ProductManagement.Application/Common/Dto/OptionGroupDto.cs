namespace ProductManagement.Application.Common.Dto;

public record OptionGroupDto(Guid Id, string Name, string SelectionType, bool? IsRequired, int? MinSelection, int? MaxSelection, List<OptionDto> Options);
