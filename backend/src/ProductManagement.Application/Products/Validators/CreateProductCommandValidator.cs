using FluentValidation;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Products.Commands;

namespace ProductManagement.Application.Products.Validators;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    private readonly IProductRepository _productRepository;

    public CreateProductCommandValidator(IProductRepository productRepository)
    {
        _productRepository = productRepository;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name must be at most 200 characters");

        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Slug is required")
            .MaximumLength(200).WithMessage("Slug must be at most 200 characters")
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$")
            .WithMessage("Slug must be lowercase letters, numbers and hyphens only");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("CategoryId is required");

        RuleFor(x => x.BasePrice)
            .GreaterThanOrEqualTo(0).WithMessage("BasePrice must be >= 0");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must be at most 2000 characters");

        // Ensure slug uniqueness (async call to repository). If repository search returns any item with same slug, validation fails.
        When(x => !string.IsNullOrWhiteSpace(x.Slug), () =>
        {
            RuleFor(x => x).MustAsync(async (cmd, ct) =>
            {
                var (items, total) = await _productRepository.SearchAsync(null, null, cmd.Slug, null, null, null, 1, 1, null, null, ct);
                return total == 0;
            }).WithMessage("A product with the same slug already exists");
        });
    }
}
