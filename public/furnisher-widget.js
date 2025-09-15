// AI Furnisher Widget
// Configure these webhook endpoints and API key:
const MAKE_CREATE_URL = "https://hook.eu2.make.com/xs8wm6vpjjadt7biarkihp4kpixnxj93";
const MAKE_STATUS_URL = "kurac";
const MAKE_API_KEY = "bager155";

window.Furnisher = {
  init: function(selector) {
    const container = document.querySelector(selector);
    if (!container) {
      console.error('Furnisher: Container not found:', selector);
      return;
    }

    let state = {
      selectedFile: null,
      style: '',
      instructions: '',
      type: 'empty',
      isProcessing: false,
      resultImage: null,
      jobId: null,
      pollInterval: null
    };

    function render() {
      container.innerHTML = `
        <div class="furnisher-widget">
          <div class="furnisher-header">
            <h1 class="furnisher-title">AI Furnisher</h1>
            <p class="furnisher-description">Transform your spaces with AI-powered furniture design</p>
          </div>

          <div class="furnisher-grid">
            <!-- Input Panel -->
            <div class="furnisher-card">
              <div class="furnisher-card-header">
                <div class="furnisher-card-title">Input Settings</div>
              </div>
              <div class="furnisher-card-content">
                <!-- File Upload -->
                <div class="furnisher-form-group">
                  <label class="furnisher-label">Image Upload</label>
                  <input type="file" name="file" accept="image/*" class="furnisher-file-upload" id="file-input">
                  <button type="button" class="furnisher-file-button" id="file-button">
                    📤 ${state.selectedFile ? state.selectedFile.name : 'Select Image'}
                  </button>
                  <div class="furnisher-file-preview" id="file-preview" style="display: ${state.selectedFile ? 'block' : 'none'}">
                    ${state.selectedFile ? `<img src="${URL.createObjectURL(state.selectedFile)}" alt="Selected">` : ''}
                  </div>
                </div>

                <!-- Style Input -->
                <div class="furnisher-form-group">
                  <label class="furnisher-label" for="style-input">Style</label>
                  <input 
                    type="text" 
                    id="style-input" 
                    class="furnisher-input" 
                    placeholder="e.g., Modern minimalist, Vintage industrial..."
                    value="${state.style}"
                  >
                </div>

                <!-- Instructions -->
                <div class="furnisher-form-group">
                  <label class="furnisher-label" for="instructions-input">Uputstva</label>
                  <textarea 
                    id="instructions-input" 
                    class="furnisher-textarea" 
                    placeholder="Additional instructions for the AI..."
                    rows="3"
                  >${state.instructions}</textarea>
                </div>

                <!-- Type Radio -->
                <div class="furnisher-form-group">
                  <label class="furnisher-label">Type</label>
                  <div class="furnisher-radio-group">
                    <div class="furnisher-radio-item">
                      <input type="radio" name="type" value="empty" class="furnisher-radio" id="type-empty" ${state.type === 'empty' ? 'checked' : ''}>
                      <label for="type-empty">Empty</label>
                    </div>
                    <div class="furnisher-radio-item">
                      <input type="radio" name="type" value="old" class="furnisher-radio" id="type-old" ${state.type === 'old' ? 'checked' : ''}>
                      <label for="type-old">Old</label>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="furnisher-actions">
                  <button 
                    class="furnisher-button furnisher-button-primary" 
                    id="generate-btn"
                    ${state.isProcessing || !state.selectedFile ? 'disabled' : ''}
                  >
                    ${state.isProcessing ? '⏳ Processing...' : '🚀 Generate'}
                  </button>
                  <button 
                    class="furnisher-button furnisher-button-outline" 
                    id="redo-btn"
                    ${state.isProcessing ? 'disabled' : ''}
                  >
                    🔄 Redo
                  </button>
                </div>
              </div>
            </div>

            <!-- Result Panel -->
            <div class="furnisher-card">
              <div class="furnisher-card-header">
                <div class="furnisher-card-title">Result</div>
              </div>
              <div class="furnisher-card-content">
                <div class="furnisher-result">
                  ${renderResult()}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      bindEvents();
    }

    function renderResult() {
      if (state.isProcessing) {
        return `
          <div class="furnisher-loading">
            <div class="furnisher-spinner"></div>
            <p>Processing your image...</p>
            ${state.jobId ? `<p class="furnisher-job-id">Job ID: ${state.jobId}</p>` : ''}
          </div>
        `;
      }

      if (state.resultImage) {
        return `
          <img src="${state.resultImage}" alt="Generated result" class="furnisher-result-image">
          <button class="furnisher-button furnisher-button-primary furnisher-save-button" id="save-btn">
            💾 Save Image
          </button>
        `;
      }

      return `<p class="furnisher-empty-state">Generated image will appear here</p>`;
    }

    function bindEvents() {
      // File upload
      const fileInput = document.getElementById('file-input');
      const fileButton = document.getElementById('file-button');
      const filePreview = document.getElementById('file-preview');

      fileButton.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          state.selectedFile = file;
          state.resultImage = null;
          render();
        }
      });

      // Style input
      const styleInput = document.getElementById('style-input');
      styleInput.addEventListener('input', (e) => {
        state.style = e.target.value;
      });

      // Instructions input
      const instructionsInput = document.getElementById('instructions-input');
      instructionsInput.addEventListener('input', (e) => {
        state.instructions = e.target.value;
      });

      // Type radio
      const typeRadios = document.querySelectorAll('input[name="type"]');
      typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (e.target.checked) {
            state.type = e.target.value;
          }
        });
      });

      // Generate button
      const generateBtn = document.getElementById('generate-btn');
      if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerate);
      }

      // Redo button
      const redoBtn = document.getElementById('redo-btn');
      if (redoBtn) {
        redoBtn.addEventListener('click', handleRedo);
      }

      // Save button
      const saveBtn = document.getElementById('save-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', handleSave);
      }
    }

    async function handleGenerate() {
      if (!state.selectedFile) {
        showToast('Error: Please select an image first.', 'error');
        return;
      }

      if (!state.style.trim()) {
        showToast('Error: Please enter a style.', 'error');
        return;
      }

      state.isProcessing = true;
      state.resultImage = null;
      render();

      try {
        const formData = new FormData();
        formData.append('file', state.selectedFile);
        formData.append('style', state.style);
        formData.append('instructions', state.instructions);
        formData.append('type', state.type);

        const response = await fetch(MAKE_CREATE_URL, {
          method: 'POST',
          headers: {
            'x-make-apikey': MAKE_API_KEY
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.jobId && data.status === 'processing') {
          state.jobId = data.jobId;
          startPolling(data.jobId);
          showToast('Processing: Your image is being generated. Please wait...', 'info');
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Generate error:', error);
        state.isProcessing = false;
        render();
        showToast('Error: Failed to start image generation. Please check your webhook configuration.', 'error');
      }
    }

    function startPolling(jobId) {
      state.pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`${MAKE_STATUS_URL}?jobId=${jobId}`, {
            headers: {
              'x-make-apikey': MAKE_API_KEY
            }
          });
          
          if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            
            if (data.status === 'done') {
              stopPolling();
              state.isProcessing = false;
              state.jobId = null;
              
              if (data.url) {
                state.resultImage = data.url;
                render();
                showToast('Success: Your image has been generated successfully!', 'success');
              }
            }
          } else {
            // Response is an image file
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            stopPolling();
            state.isProcessing = false;
            state.jobId = null;
            state.resultImage = imageUrl;
            render();
            
            showToast('Success: Your image has been generated successfully!', 'success');
          }
        } catch (error) {
          console.error('Polling error:', error);
          stopPolling();
          state.isProcessing = false;
          state.jobId = null;
          render();
          showToast('Error: Failed to check job status. Please try again.', 'error');
        }
      }, 3000);
    }

    function stopPolling() {
      if (state.pollInterval) {
        clearInterval(state.pollInterval);
        state.pollInterval = null;
      }
    }

    function handleRedo() {
      state.style = '';
      state.instructions = '';
      state.resultImage = null;
      stopPolling();
      state.isProcessing = false;
      state.jobId = null;
      render();
    }

    function handleSave() {
      if (!state.resultImage) return;

      if (state.resultImage.startsWith('blob:')) {
        // Download blob URL
        const link = document.createElement('a');
        link.href = state.resultImage;
        link.download = 'generated-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Open external URL
        window.open(state.resultImage, '_blank');
      }
    }

    function showToast(message, type) {
      // Simple toast notification
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
      `;

      switch (type) {
        case 'success':
          toast.style.backgroundColor = 'hsl(142 76% 36%)';
          break;
        case 'error':
          toast.style.backgroundColor = 'hsl(0 84% 60%)';
          break;
        case 'info':
        default:
          toast.style.backgroundColor = 'hsl(221 83% 53%)';
          break;
      }

      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 5000);
    }

    // Initialize
    render();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      stopPolling();
    });
  }
};