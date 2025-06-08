// This script runs after the page loads to ensure markdown content is properly styled
document.addEventListener('DOMContentLoaded', () => {
  // Get the content container
  const content = document.querySelector('.blog-post-content');
  if (!content) return;
  
  // Add styling to links
  const links = content.querySelectorAll('a');
  links.forEach(link => {
    link.style.color = '#00ffcc';
    link.style.textDecoration = 'none';
    link.style.borderBottom = '2px solid rgba(0, 255, 204, 0.5)';
    link.style.transition = 'all 0.3s ease';
    link.style.fontWeight = '600';
    link.style.padding = '0 0.15rem 2px';
    link.style.borderRadius = '2px';
    
    // Add hover effect
    link.addEventListener('mouseenter', () => {
      link.style.color = '#ffffff';
      link.style.backgroundColor = 'rgba(0, 255, 204, 0.2)';
      link.style.borderColor = '#00ffcc';
    });
    
    // Remove hover effect
    link.addEventListener('mouseleave', () => {
      link.style.color = '#00ffcc';
      link.style.backgroundColor = 'transparent';
      link.style.borderColor = 'rgba(0, 255, 204, 0.5)';
    });
  });
  
  // Add styling to tables
  const tables = content.querySelectorAll('table');
  tables.forEach(table => {
    // Table styles
    table.style.width = '100%';
    table.style.borderCollapse = 'separate';
    table.style.borderSpacing = '0';
    table.style.margin = '2.5rem 0';
    table.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    table.style.borderRadius = '8px';
    table.style.overflow = 'hidden';
    table.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    table.style.border = '1px solid rgba(0, 255, 204, 0.15)';
    
    // Header styles
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
      header.style.backgroundColor = 'rgba(0, 255, 204, 0.15)';
      header.style.color = '#00ffcc';
      header.style.fontWeight = '600';
      header.style.textAlign = 'left';
      header.style.padding = '1.25rem 1rem';
      header.style.borderBottom = '2px solid rgba(0, 255, 204, 0.3)';
    });
    
    // Cell styles
    const cells = table.querySelectorAll('td');
    cells.forEach(cell => {
      cell.style.padding = '1rem';
      cell.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
      cell.style.color = 'rgba(255, 255, 255, 0.9)';
    });
    
    // Hover effect for rows
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        const rowCells = row.querySelectorAll('td');
        rowCells.forEach(cell => {
          cell.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        });
      });
      
      row.addEventListener('mouseleave', () => {
        const rowCells = row.querySelectorAll('td');
        rowCells.forEach(cell => {
          cell.style.backgroundColor = '';
        });
      });
    });
  });
});
