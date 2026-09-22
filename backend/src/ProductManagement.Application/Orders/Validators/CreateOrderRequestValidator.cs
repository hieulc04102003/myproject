using FluentValidation;
using ProductManagement.Application.Orders.Requests;

namespace ProductManagement.Application.Orders.Validators;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId is required");
        RuleFor(x => x.Items).NotEmpty().WithMessage("At least one order item is required");
        RuleForEach(x => x.Items).SetValidator(new CreateOrderItemRequestValidator());
    }
}
