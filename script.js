document.addEventListener('DOMContentLoaded', function() {
  const chessBoard = document.getElementById('chessBoard');
  const boardSize = 8;
  let selectedPiece = null;
  let selectedSquare = null;
  
  const initialBoard = [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];
  
  for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
          const square = document.createElement('div');
          square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
          square.dataset.row = row;
          square.dataset.col = col;
          
          if (col === 0) {
              const rank = document.createElement('span');
              rank.className = `coordinates rank ${(row + col) % 2 === 0 ? 'black-coord' : 'white-coord'}`;
              rank.textContent = 8 - row;
              square.appendChild(rank);
          }
          
          if (row === 7) {
              const file = document.createElement('span');
              file.className = `coordinates file ${(row + col) % 2 === 0 ? 'black-coord' : 'white-coord'}`;
              file.textContent = String.fromCharCode(97 + col);
              square.appendChild(file);
          }
          
          const piece = initialBoard[row][col];
          if (piece) {
              const pieceElement = document.createElement('div');
              pieceElement.className = 'piece';
              pieceElement.dataset.piece = piece;
              pieceElement.dataset.row = row;
              pieceElement.dataset.col = col;
              
              const pieceType = piece.toLowerCase();
              const pieceColor = piece === piece.toUpperCase() ? 'w' : 'b';
              pieceElement.style.backgroundImage = `url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${pieceColor}${pieceType}.png')`;
              
              pieceElement.draggable = true;
              pieceElement.addEventListener('dragstart', dragStart);
              pieceElement.addEventListener('dragend', dragEnd);
              
              square.appendChild(pieceElement);
          }
          
          square.addEventListener('dragover', dragOver);
          square.addEventListener('dragenter', dragEnter);
          square.addEventListener('dragleave', dragLeave);
          square.addEventListener('drop', drop);
          
          square.addEventListener('click', squareClick);
          
          chessBoard.appendChild(square);
      }
  }
  
  function dragStart(e) {
      selectedPiece = e.target;
      selectedSquare = e.target.parentElement;
      setTimeout(() => {
          e.target.style.display = 'none';
      }, 0);
      
      showPossibleMoves(parseInt(selectedSquare.dataset.row), parseInt(selectedSquare.dataset.col));
  }
  
  function dragEnd(e) {
      e.target.style.display = 'block';
      clearHighlights();
  }
  
  function dragOver(e) {
      e.preventDefault();
  }
  
  function dragEnter(e) {
      e.preventDefault();
      if (e.target.classList.contains('square')) {
          e.target.classList.add('highlight');
      }
  }
  
  function dragLeave(e) {
      if (e.target.classList.contains('square')) {
          e.target.classList.remove('highlight');
      }
  }
  
  function drop(e) {
      e.preventDefault();
      if (e.target.classList.contains('square')) {
          e.target.classList.remove('highlight');
          
          if (selectedPiece && selectedSquare !== e.target) {

            const existingPiece = e.target.querySelector('.piece');
              if (existingPiece) {
                  e.target.removeChild(existingPiece);
              }
              

              e.target.appendChild(selectedPiece);
              selectedPiece.dataset.row = e.target.dataset.row;
              selectedPiece.dataset.col = e.target.dataset.col;
          }
      }
      
      clearHighlights();
  }
  

  function squareClick(e) {
      const square = e.target.classList.contains('square') ? e.target : e.target.closest('.square');
      if (!square) return;
      
      const piece = square.querySelector('.piece');
      
      if (selectedPiece) {

        if (piece === selectedPiece) {
              clearHighlights();
              selectedPiece = null;
              selectedSquare = null;
              return;
          }
          
          if (selectedSquare !== square) {

            if (piece) {
                  square.removeChild(piece);
              }
              

              square.appendChild(selectedPiece);
              selectedPiece.dataset.row = square.dataset.row;
              selectedPiece.dataset.col = square.dataset.col;
          }
      
          clearHighlights();
          selectedPiece = null;
          selectedSquare = null;
      } else if (piece) {
          selectedPiece = piece;
          selectedSquare = square;
          showPossibleMoves(parseInt(square.dataset.row), parseInt(square.dataset.col));
      }
  }
  
  function showPossibleMoves(row, col) {
      const piece = initialBoard[row][col];
      if (!piece) return;
      
      const pieceType = piece.toLowerCase();
      
      if (pieceType === 'p') {
          const direction = piece === 'p' ? 1 : -1; 
          
          const forwardRow = row + direction;
          if (forwardRow >= 0 && forwardRow < 8 && !initialBoard[forwardRow][col]) {
              highlightSquare(forwardRow, col);
              

              const startRow = piece === 'p' ? 1 : 6;
              if (row === startRow && !initialBoard[row + 2*direction][col]) {
                  highlightSquare(row + 2*direction, col);
              }
          }
          
          for (const captureCol of [col - 1, col + 1]) {
              if (captureCol >= 0 && captureCol < 8) {
                  const captureRow = row + direction;
                  if (captureRow >= 0 && captureRow < 8) {
                      const targetPiece = initialBoard[captureRow][captureCol];
                      if (targetPiece && 
                          (piece === piece.toUpperCase()) !== (targetPiece === targetPiece.toUpperCase())) {
                          highlightSquare(captureRow, captureCol);
                      }
                  }
              }
          }
      }
      
      if (pieceType === 'n') {
          const knightMoves = [
              [row - 2, col - 1], [row - 2, col + 1],
              [row - 1, col - 2], [row - 1, col + 2],
              [row + 1, col - 2], [row + 1, col + 2],
              [row + 2, col - 1], [row + 2, col + 1]
          ];
          
          for (const [r, c] of knightMoves) {
              if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                  const targetPiece = initialBoard[r][c];
                  if (!targetPiece || 
                      (piece === piece.toUpperCase()) !== (targetPiece === targetPiece.toUpperCase())) {
                      highlightSquare(r, c);
                  }
              }
          }
      }
  }
  
  function highlightSquare(row, col) {
      const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
      if (square) {
          const highlight = document.createElement('div');
          highlight.className = 'possible-move';
          square.appendChild(highlight);
      }
  }
  
  function clearHighlights() {
      document.querySelectorAll('.possible-move').forEach(highlight => {
          highlight.remove();
      });
      
      document.querySelectorAll('.highlight').forEach(square => {
          square.classList.remove('highlight');
      });
  }
});