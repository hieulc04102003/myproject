using FluentValidation;
using ProductManagement.Application.Orders.Requests;

namespace ProductManagement.Application.Orders.Validators;

public class CreateOrderItemRequestValidator : AbstractValidator<CreateOrderItemRequest>
{
    public CreateOrderItemRequestValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("ProductId is required");
        RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Quantity must be at least 1");
        RuleForEach(x => x.OptionIds ?? new List<Guid>())
            .Must(id => id != Guid.Empty).WithMessage("OptionId must be a valid GUID");
    }
}
