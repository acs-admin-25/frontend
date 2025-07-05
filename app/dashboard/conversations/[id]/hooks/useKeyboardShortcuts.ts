import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onSendMessage: () => void;
  onGenerateResponse: () => void;
  onSearch: () => void;
  onJumpToUnread: () => void;
}

export function useKeyboardShortcuts({
  onToggleLeftPanel,
  onToggleRightPanel,
  onSendMessage,
  onGenerateResponse,
  onSearch,
  onJumpToUnread
}: KeyboardShortcutsProps) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    // Ctrl/Cmd + \ to toggle panels
    if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
      event.preventDefault();
      // Toggle the panel that's currently visible, or left panel by default
      const leftPanel = document.querySelector('[data-panel="left"]');
      const rightPanel = document.querySelector('[data-panel="right"]');
      
      if (leftPanel && !leftPanel.classList.contains('hidden')) {
        onToggleLeftPanel();
      } else if (rightPanel && !rightPanel.classList.contains('hidden')) {
        onToggleRightPanel();
      } else {
        onToggleLeftPanel();
      }
    }

    // Ctrl/Cmd + Enter to send message
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      onSendMessage();
    }

    // Ctrl/Cmd + G to generate AI response
    if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
      event.preventDefault();
      onGenerateResponse();
    }

    // Ctrl/Cmd + F to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      onSearch();
    }

    // Ctrl/Cmd + U to jump to unread
    if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
      event.preventDefault();
      onJumpToUnread();
    }

    // Escape to close modals or clear search
    if (event.key === 'Escape') {
      const searchInput = document.querySelector('input[placeholder*="search"]') as HTMLInputElement;
      if (searchInput && searchInput.value) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      // Close any open modals
      const modals = document.querySelectorAll('[role="dialog"]');
      modals.forEach(modal => {
        const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
        }
      });
    }
  }, [onToggleLeftPanel, onToggleRightPanel, onSendMessage, onGenerateResponse, onSearch, onJumpToUnread]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return a function to show keyboard shortcuts help
  const showKeyboardShortcuts = useCallback(() => {
    const shortcuts = [
      { key: 'Ctrl + \\', description: 'Toggle panels' },
      { key: 'Ctrl + Enter', description: 'Send message' },
      { key: 'Ctrl + G', description: 'Generate AI response' },
      { key: 'Ctrl + F', description: 'Focus search' },
      { key: 'Ctrl + U', description: 'Jump to unread' },
      { key: 'Escape', description: 'Close modals / Clear search' }
    ];

    // Create a simple help modal
    const helpModal = document.createElement('div');
    helpModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    helpModal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Keyboard Shortcuts</h3>
          <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">×</button>
        </div>
        <div class="space-y-2">
          ${shortcuts.map(shortcut => `
            <div class="flex justify-between items-center">
              <kbd class="px-2 py-1 bg-gray-100 rounded text-sm font-mono">${shortcut.key}</kbd>
              <span class="text-sm text-gray-600">${shortcut.description}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        helpModal.remove();
      }
    });

    document.body.appendChild(helpModal);
  }, []);

  return { showKeyboardShortcuts };
} 