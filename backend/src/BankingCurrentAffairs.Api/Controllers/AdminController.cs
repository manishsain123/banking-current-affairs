using BankingCurrentAffairs.Core.DTOs;
using BankingCurrentAffairs.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BankingCurrentAffairs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly ICurrentAffairsService _currentAffairsService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(ICurrentAffairsService currentAffairsService, ILogger<AdminController> logger)
    {
        _currentAffairsService = currentAffairsService;
        _logger = logger;
    }

    [HttpPost("items")]
    [ProducesResponseType(typeof(CurrentAffairItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateItem([FromBody] CreateOrUpdateAffairDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = await _currentAffairsService.CreateItemAsync(dto);
        return CreatedAtAction(nameof(CurrentAffairsController.GetItemById), "CurrentAffairs", new { id = created.Id }, created);
    }

    [HttpPut("items/{id:guid}")]
    [ProducesResponseType(typeof(CurrentAffairItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateItem(Guid id, [FromBody] CreateOrUpdateAffairDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = await _currentAffairsService.UpdateItemAsync(id, dto);
        if (updated == null)
        {
            return NotFound(new { message = $"Item with ID {id} not found." });
        }

        return Ok(updated);
    }

    [HttpDelete("items/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteItem(Guid id)
    {
        var deleted = await _currentAffairsService.DeleteItemAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = $"Item with ID {id} not found." });
        }

        return NoContent();
    }
}
