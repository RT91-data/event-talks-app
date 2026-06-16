document.addEventListener('DOMContentLoaded', () => {
    // State Management
    let releasesData = [];
    let currentFilter = 'all';
    let searchQuery = '';
    
    // Tweet Compose State
    let selectedUpdate = {
        date: '',
        type: '',
        descText: '',
        link: ''
    };
    let activeTags = ['#BigQuery', '#GoogleCloud'];

    // DOM Elements
    const container = document.getElementById('releases-container');
    const loadingState = document.getElementById('loading-state');
    const statusMessage = document.getElementById('status-message');
    const statusText = document.getElementById('status-text');
    const cacheTimeEl = document.getElementById('cache-time');
    
    const btnRefresh = document.getElementById('btn-refresh');
    const spinner = document.getElementById('spinner');
    
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Stats Elements
    const statFeatures = document.getElementById('stat-features');
    const statIssues = document.getElementById('stat-issues');
    const statChanges = document.getElementById('stat-changes');
    const statTotal = document.getElementById('stat-total');
    
    // Modal Elements
    const tweetModal = document.getElementById('tweet-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCountEl = document.getElementById('char-count');
    const tweetSourceDate = document.getElementById('tweet-source-date');
    const modalUpdatePreview = document.getElementById('modal-update-preview');
    const hashtagContainer = document.getElementById('hashtag-container');
    const btnCopyTweet = document.getElementById('btn-copy-tweet');
    const btnPostTweet = document.getElementById('btn-post-tweet');
    
    // Toast Element
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // Fetch Release Notes
    async function fetchReleases(forceRefresh = false) {
        setLoading(true);
        try {
            const url = `/api/releases${forceRefresh ? '?refresh=true' : ''}`;
            const response = await fetch(url);
            const resData = await response.json();
            
            if (resData.status === 'success' || resData.status === 'warning') {
                releasesData = resData.data;
                
                // Show status warning if any
                if (resData.status === 'warning') {
                    showStatus(resData.message, 'warning');
                } else {
                    hideStatus();
                }
                
                // Set cache time
                if (resData.cached_at) {
                    const date = new Date(resData.cached_at * 1000);
                    cacheTimeEl.textContent = `Updated: ${date.toLocaleTimeString()}`;
                }
                
                calculateStats();
                renderReleases();
            } else {
                showStatus(resData.message || 'Failed to fetch release notes.', 'error');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showStatus('An error occurred while connecting to the server.', 'error');
        } finally {
            setLoading(false);
        }
    }

    // Set Loading State
    function setLoading(isLoading) {
        if (isLoading) {
            loadingState.classList.remove('hidden');
            container.classList.add('hidden');
            spinner.classList.add('spinning');
            btnRefresh.disabled = true;
        } else {
            loadingState.classList.add('hidden');
            container.classList.remove('hidden');
            spinner.classList.remove('spinning');
            btnRefresh.disabled = false;
        }
    }

    // Show Status Banner
    function showStatus(message, type) {
        statusMessage.classList.remove('hidden');
        statusText.textContent = message;
        if (type === 'error') {
            statusMessage.style.borderColor = 'var(--color-breaking)';
        } else if (type === 'warning') {
            statusMessage.style.borderColor = 'var(--color-issue)';
        }
    }

    function hideStatus() {
        statusMessage.classList.add('hidden');
    }

    // Calculate Stats
    function calculateStats() {
        let features = 0;
        let issues = 0;
        let changes = 0;
        let total = 0;

        releasesData.forEach(entry => {
            entry.updates.forEach(upd => {
                total++;
                const type = upd.type.toLowerCase();
                if (type === 'feature') features++;
                else if (type === 'issue' || type === 'breaking') issues++;
                else changes++;
            });
        });

        // Animate count-up for stats
        animateCount(statFeatures, features);
        animateCount(statIssues, issues);
        animateCount(statChanges, changes);
        animateCount(statTotal, total);
    }

    function animateCount(element, target) {
        let current = 0;
        const duration = 800; // ms
        const stepTime = Math.max(Math.floor(duration / (target || 1)), 15);
        
        if (target === 0) {
            element.textContent = '0';
            return;
        }

        const timer = setInterval(() => {
            current += Math.ceil(target / 20);
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = current;
            }
        }, stepTime);
    }

    // Filter type tags mapping to class
    function getTypeBadgeClass(type) {
        const t = type.toLowerCase();
        if (t === 'feature') return 'feature';
        if (t === 'issue') return 'issue';
        if (t === 'breaking') return 'breaking';
        if (t === 'change') return 'change';
        if (t === 'announcement') return 'announcement';
        return 'general';
    }

    // Render Releases
    function renderReleases() {
        container.innerHTML = '';
        
        const filteredEntries = [];
        
        releasesData.forEach(entry => {
            // Filter updates in this entry
            const matchingUpdates = entry.updates.filter(upd => {
                // Filter by type
                const matchesFilter = (currentFilter === 'all' || upd.type.toLowerCase() === currentFilter.toLowerCase());
                
                // Filter by search query
                const matchesSearch = !searchQuery || 
                    upd.type.toLowerCase().includes(searchQuery) ||
                    upd.description_text.toLowerCase().includes(searchQuery) ||
                    entry.date.toLowerCase().includes(searchQuery);
                    
                return matchesFilter && matchesSearch;
            });
            
            if (matchingUpdates.length > 0) {
                filteredEntries.push({
                    ...entry,
                    updates: matchingUpdates
                });
            }
        });

        if (filteredEntries.length === 0) {
            container.innerHTML = `
                <div class="glass-card animate-fade-in" style="padding: 3rem; text-align: center; color: var(--color-text-muted);">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--color-text-dim);"></i>
                    <p>No release notes found matching the filters or search query.</p>
                </div>
            `;
            return;
        }

        filteredEntries.forEach((entry, idx) => {
            const card = document.createElement('div');
            card.className = 'release-group-card glass-card animate-fade-in';
            card.style.animationDelay = `${idx * 0.05}s`;
            
            // Build updates HTML
            let updatesHtml = '';
            entry.updates.forEach(upd => {
                // Highlight search text if query exists
                let descHtml = upd.description_html;
                if (searchQuery) {
                    const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
                    // We don't want to replace inside HTML tags themselves, so we only target text outside tags
                    // A simple approximation is highlighting the plain text description or basic tag-safe highlights
                    // To keep it simple and robust, we can just display the parsed HTML normally.
                }

                updatesHtml += `
                    <div class="update-item">
                        <div class="update-item-header">
                            <div class="update-type-container">
                                <span class="badge ${getTypeBadgeClass(upd.type)}">${upd.type}</span>
                            </div>
                            <div class="update-actions">
                                <button class="btn-action btn-action-tweet" data-date="${entry.date}" data-type="${upd.type}" data-text="${encodeURIComponent(upd.description_text)}" data-link="${entry.link}" title="Tweet about this update">
                                    <i class="fa-brands fa-x-twitter"></i>
                                </button>
                            </div>
                        </div>
                        <div class="update-description">
                            ${descHtml}
                        </div>
                    </div>
                `;
            });

            card.innerHTML = `
                <div class="release-group-header">
                    <div class="release-date">
                        <i class="fa-regular fa-calendar-check"></i>
                        <span>${entry.date}</span>
                    </div>
                    ${entry.link ? `<a href="${entry.link}" target="_blank" class="release-link">View Docs <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
                </div>
                <div class="update-items-list">
                    ${updatesHtml}
                </div>
            `;
            
            container.appendChild(card);
        });

        // Add event listeners to the new tweet buttons
        document.querySelectorAll('.btn-action-tweet').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const date = button.getAttribute('data-date');
                const type = button.getAttribute('data-type');
                const descText = decodeURIComponent(button.getAttribute('data-text'));
                const link = button.getAttribute('data-link');
                
                openTweetModal(date, type, descText, link);
            });
        });
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Open Tweet Compose Modal
    function openTweetModal(date, type, descText, link) {
        selectedUpdate = { date, type, descText, link };
        
        // Setup initial modal elements
        tweetSourceDate.textContent = `Source: BigQuery Release Notes (${date})`;
        modalUpdatePreview.textContent = `[${type}] ${descText}`;
        
        // Update tags visual state
        updateTagPills();
        
        // Generate tweet text
        rebuildTweetText();
        
        // Show modal
        tweetModal.classList.remove('hidden');
    }

    // Close Modal
    function closeModal() {
        tweetModal.classList.add('hidden');
    }

    // Rebuild Tweet Content dynamically
    function rebuildTweetText() {
        const hashtags = activeTags.join(' ');
        const url = selectedUpdate.link || '';
        
        // Setup formatting
        const prefix = `BigQuery Update: [${selectedUpdate.type}] `;
        
        // Overhead calculations (prefix + spacings + URL + tags)
        const linkText = url ? `\n\nDocs: ${url}` : '';
        const tagsText = hashtags ? `\n${hashtags}` : '';
        
        const suffix = linkText + tagsText;
        const totalOverhead = prefix.length + suffix.length;
        const maxDescLen = 280 - totalOverhead;
        
        let desc = selectedUpdate.descText;
        if (desc.length > maxDescLen) {
            desc = desc.substring(0, maxDescLen - 3) + '...';
        }
        
        tweetTextarea.value = prefix + desc + suffix;
        updateCharCount();
    }

    // Update characters counter
    function updateCharCount() {
        const len = tweetTextarea.value.length;
        charCountEl.textContent = len;
        
        charCountEl.className = 'char-count';
        if (len >= 260 && len < 280) {
            charCountEl.classList.add('warning');
        } else if (len >= 280) {
            charCountEl.classList.add('error');
        }
    }

    // Render quick hashtag pills
    function updateTagPills() {
        const pills = hashtagContainer.querySelectorAll('.tag-pill');
        pills.forEach(pill => {
            const tag = pill.getAttribute('data-tag');
            if (activeTags.includes(tag)) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
    }

    // Copy to clipboard
    function copyTweet() {
        tweetTextarea.select();
        navigator.clipboard.writeText(tweetTextarea.value)
            .then(() => {
                showToast('Tweet copied to clipboard!', 'fa-solid fa-copy');
            })
            .catch(err => {
                console.error('Copy failed:', err);
                showToast('Failed to copy text', 'fa-solid fa-circle-exclamation');
            });
    }

    // Open X share window
    function shareOnTwitter() {
        const text = encodeURIComponent(tweetTextarea.value);
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(url, '_blank', 'width=550,height=420');
        closeModal();
        showToast('Redirected to X!', 'fa-brands fa-x-twitter');
    }

    // Show Toast Notification
    function showToast(message, iconClass) {
        toastMessage.textContent = message;
        const icon = document.getElementById('toast-icon');
        icon.className = iconClass;
        
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Listeners for Modal
    btnCloseModal.addEventListener('click', closeModal);
    tweetModal.addEventListener('click', (e) => {
        if (e.target === tweetModal) closeModal();
    });

    tweetTextarea.addEventListener('input', updateCharCount);

    btnCopyTweet.addEventListener('click', copyTweet);
    btnPostTweet.addEventListener('click', shareOnTwitter);

    // Hashtag Toggles Event
    hashtagContainer.querySelectorAll('.tag-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            const tag = e.currentTarget.getAttribute('data-tag');
            const idx = activeTags.indexOf(tag);
            
            if (idx > -1) {
                activeTags.splice(idx, 1);
            } else {
                activeTags.push(tag);
            }
            
            updateTagPills();
            rebuildTweetText();
        });
    });

    // Refresh Event
    btnRefresh.addEventListener('click', () => {
        fetchReleases(true);
    });

    // Search input event (debounced)
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderReleases();
        }, 250);
    });

    // Filter Buttons Event
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            currentFilter = e.currentTarget.getAttribute('data-filter');
            renderReleases();
        });
    });

    // Initial load
    fetchReleases();
});
