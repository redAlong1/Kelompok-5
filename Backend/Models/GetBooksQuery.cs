using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.Models
{
    public class GetBooksQuery
    {
        private string? _search {  get; set; }
        [FromQuery(Name = "page")]
        [Range(1, int.MaxValue)]
        public int Page { get; set; } = 1;

        [FromQuery(Name = "limit")]
        [Range(1, 100)]
        public int Limit { get; set; } = 10;

        [FromQuery(Name = "search")]
        [StringLength(100)]
        public string? Search
        {
            get => _search;
            set => _search = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        [FromQuery(Name = "category_id")]
        [Range(1, int.MaxValue)]
        public int CategoryId { get; set; }

        [FromQuery(Name = "stock_status")]
        public string StockStatus { get; set; }

        [FromQuery(Name = "sort")]
        public int Sort { get; set; }

        [FromQuery(Name = "order")]
        public int Order { get; set; }

        public int Skip => (Page - 1) * Limit;
    }
}
