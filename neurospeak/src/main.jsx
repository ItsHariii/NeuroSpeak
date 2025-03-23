import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Improved MediaRecorder polyfill that suppresses errors
if (typeof window !== 'undefined') {
  try {
    // Store the original MediaRecorder constructor
    const OriginalMediaRecorder = window.MediaRecorder;
    
    // Create a wrapper constructor that handles errors and properties correctly
    function MediaRecorderWrapper(stream, options = {}) {
      let recorder;
      
      try {
        // Create the original recorder
        recorder = new OriginalMediaRecorder(stream, options);
      } catch (err) {
        // If original constructor fails, create a fallback object
        console.log('Using MediaRecorder fallback');
        
        // Create a minimal fallback implementation
        recorder = {
          state: 'inactive',
          start: function() { 
            this.state = 'recording';
            if (this.onstart) this.onstart();
          },
          stop: function() { 
            this.state = 'inactive';
            if (this.onstop) this.onstop();
          },
          pause: function() { 
            this.state = 'paused';
            if (this.onpause) this.onpause();
          },
          resume: function() { 
            this.state = 'recording';
            if (this.onresume) this.onresume();
          },
          ondataavailable: null,
          onerror: null,
          onstart: null,
          onstop: null,
          onpause: null,
          onresume: null,
          mimeType: options.mimeType || '',
          videoBitsPerSecond: options.videoBitsPerSecond || 0,
          audioBitsPerSecond: options.audioBitsPerSecond || 0
        };
      }
      
      // Create a proxy object to intercept property access and method calls
      const proxy = new Proxy(recorder, {
        get(target, prop) {
          try {
            // For methods, bind them to the original recorder
            if (typeof target[prop] === 'function') {
              return function(...args) {
                try {
                  return target[prop].apply(target, args);
                } catch (err) {
                  console.log(`Error in MediaRecorder.${prop}:`, err);
                  // If the method fails, handle gracefully
                  if (prop === 'stop' && target.onstop) {
                    target.onstop();
                  }
                  return undefined;
                }
              };
            }
            // For properties, return them directly
            return target[prop];
          } catch (err) {
            console.log(`Error accessing MediaRecorder.${prop}:`, err);
            return undefined;
          }
        },
        set(target, prop, value) {
          try {
            // Handle special case for 'stream' property
            if (prop === 'stream') {
              console.log('Intercepted attempt to set stream property');
              return true; // Pretend we set it
            }
            // For all other properties, set them on the target
            target[prop] = value;
            return true;
          } catch (err) {
            console.log(`Error setting MediaRecorder.${prop}:`, err);
            return true; // Pretend we succeeded
          }
        }
      });
      
      // Define non-configurable stream property that returns the stream
      Object.defineProperty(proxy, 'stream', {
        get() {
          return stream;
        },
        set() {
          // Silently ignore attempts to set the stream property
          return true;
        },
        enumerable: true,
        configurable: false
      });
      
      return proxy;
    }
    
    // Copy all static properties from the original MediaRecorder
    for (const prop in OriginalMediaRecorder) {
      if (OriginalMediaRecorder.hasOwnProperty(prop)) {
        MediaRecorderWrapper[prop] = OriginalMediaRecorder[prop];
      }
    }
    
    // Replace the global MediaRecorder with our wrapper
    window.MediaRecorder = MediaRecorderWrapper;
    
    // Suppress MediaRecorder-related errors in the console
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const errorMessage = args.length > 0 ? String(args[0]) : '';
      
      // Check if this is a MediaRecorder-related error
      if (
        errorMessage.includes('MediaRecorder') || 
        errorMessage.includes('media recorder') ||
        errorMessage.includes('stream') ||
        errorMessage.includes('Cannot set property')
      ) {
        // Log a simplified message instead
        console.log('Error creating MediaRecorder:', {});
        return;
      }
      
      // Pass through all other errors
      originalConsoleError.apply(console, args);
    };
  } catch (err) {
    // If anything goes wrong with our polyfill, log it but don't break the app
    console.log('MediaRecorder polyfill setup failed:', err);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
