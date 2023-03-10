import songList from "./songs.js";

$(function () {
    const PLAYER_STORAGE_KEY = 'M_PLAYER';
    const $cd = $('.cd');
    const $heading = $('header h2');
    const $audio = $('#audio');
    const $cdThumb = $('.cd-thumb');
    const $playBtn = $('.btn-toggle-play')
    const $player = $('.player');
    const $progress = $('#progress');
    const $nextBtn = $('.btn-next')
    const $prevBtn = $('.btn-prev')
    const $randomBtn = $('.btn-random');
    const $repeatBtn = $('.btn-repeat');
    const $playlist = $('.playlist');


    const app = {
        isPlaying: false,
        isRandom: false,
        isRepeat: false,
        currentIndex: 0,

        config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

        setConfig: function (key, value) {
            this.config[key] = value;
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
        },
        songs: songList,
        getRandomIndex() {
            console.log(this.songs.length)
            return Math.floor(Math.random() * (this.songs.length));
        },
        defineProperties() {
            Object.defineProperty(this, 'currentSong', {
                get: function () {
                    return this.songs[this.currentIndex];
                }
            })
        },
        render() {
            if ($playlist.find('.song').length === 0) {
                let res = this.songs.map((song, index) => {
                    return `
                    <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                        <div class="thumb"
                             style="background-image: url('${song.image}')"></div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="options">
                            <i class="fa-solid fa-ellipsis-h"></i>
                        </div>
                      </div>
                `;
                });
                $playlist.append(res.join(''));
            } else {
                $playlist.find('.active').removeClass('active');
                $playlist.find('.song').eq(this.currentIndex).addClass('active')
                const $activeSong = $('.song.active');
                $activeSong[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }


        },
        handleEvents() {
            const _this = this;
            const cdWidth = $cd.width();

            function resetProgress() {
                $progress.attr('value', 0);
            }

            // X??? l?? k??o danh s??ch b??i h??t
            $(window).scroll(function () {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const newCdWidth = cdWidth - scrollTop;

                $cd.css({'opacity': newCdWidth / cdWidth})
                $cd.width(newCdWidth)
            });

            // Quay cd
            const $cdThumbAnimation = $cdThumb[0].animate({
                transform: 'rotate(360deg)'
            }, {
                duration: 15000, iterations: Infinity
            })
            $cdThumbAnimation.pause();

            // Khi click play
            $playBtn.on('click', function () {
                $player.toggleClass("playing");
                const icon = $playBtn.find('i');
                if (app.isPlaying) {
                    $audio.trigger('pause');
                    icon.toggleClass("fa-play-circle fa-pause-circle")
                    $cdThumbAnimation.pause();

                } else {
                    $audio.trigger('play');
                    icon.toggleClass("fa-play-circle fa-pause-circle")
                    $cdThumbAnimation.play();
                }
            })

            // Play audio
            $audio.on('play', function () {
                _this.isPlaying = true;
            })

            // Pause audio
            $audio.on('pause', function () {
                _this.isPlaying = false;

            })

            //Khi audio end 1 bai hat
            $audio.on('ended', function () {
                if (_this.isRepeat) {
                    $audio.trigger('play');
                } else {
                    $nextBtn.trigger('click');
                    $audio.trigger('play');
                }
            })

            // Khi thay ?????i th???i ??i???m b??i h??t
            $audio.on('timeupdate', function () {
                if ($audio[0].duration) {
                    const progressPercent = $audio[0].currentTime / $audio[0].duration * 100
                    $progress.attr('value', progressPercent * 10);
                    $progress.css('background', `linear-gradient(to right, #ec1f55 0%, #ec1f55 ${progressPercent + 0.5}%, #d3d3d3 ${progressPercent / 10 + 0.5}%, #d3d3d3 100%`);
                    // $progress.trigger('change');
                }
            })

            // // Khi thay ?????i thanh ti???n ?????
            // $progress.on('mouseup', (e) => {
            //     console.log(e)
            //     if (!(e.originalEvent === undefined)) {
            //         //C???p nh???t th???i gian audio d???a tr??n value c???a progressBar
            //         $progress.val(e.target.value);
            //
            //         const currentPercent = e.target.value / 1000;
            //         const seekTo = $audio[0].duration * currentPercent;
            //         if (seekTo > 0 && seekTo <= $audio[0].duration) {
            //             if ($audio[0].readyState === HTMLAudioElement.HAVE_ENOUGH_DATA) {
            //                 //TODO: CANT SEEK IN CHROME
            //                 $audio[0].currentTime = seekTo;
            //             }
            //         }
            //         console.log(seekTo, $audio[0].currentTime);
            //     }
            // })


            //Khi next song
            $nextBtn.on('click', function () {
                if (_this.isRandom) {
                    _this.playRandomSong();
                } else {
                    _this.nextSong();
                }
                _this.render();
                resetProgress();
                $cdThumbAnimation.cancel();

                if (_this.isPlaying) {
                    $cdThumbAnimation.play();
                    $audio.trigger('play');
                }

            })


            //khi prev song
            $prevBtn.on('click', function () {
                if (_this.isRandom) {
                    _this.playRandomSong();
                } else {
                    _this.prevSong()
                }
                _this.render();
                resetProgress();
                $cdThumbAnimation.cancel();

                if (_this.isPlaying) {
                    $cdThumbAnimation.play();
                    $audio.trigger('play');
                }
            })

            //Random song
            $randomBtn.on('click', function () {
                _this.isRandom = !_this.isRandom;
                _this.setConfig('isRandom', _this.isRandom)
                $randomBtn.toggleClass('active')
            })

            //Xu ly btn repeat
            $repeatBtn.on('click', function () {
                _this.isRepeat = !_this.isRepeat;
                _this.setConfig('isRepeat', _this.isRepeat)
                $repeatBtn.toggleClass("active");
            })

            //click t??? playlist
            $playlist.on('click', function (e) {
                const songClicked = $(e.target.closest('.song:not(.active)'));
                const optionsClicked = $(e.target.closest('.options'));
                if (songClicked || optionsClicked) {
                    if (songClicked) {
                        _this.currentIndex = songClicked.data('index')
                        _this.loadCurrentSong();
                        _this.render();
                        $audio.trigger('play');
                    } else {

                    }
                }
            })


        },
        loadConfig() {
            this.isRepeat = this.config.isRepeat;
            this.isRandom = this.config.isRandom;

            if(this.isRepeat){
                $repeatBtn.addClass('active');
            }
            if(this.isRandom){
                $randomBtn.addClass('active');
            }

        },

        loadCurrentSong() {
            $cdThumb.css({'background-image': `url(${this.currentSong.image})`});
            $heading.text(this.currentSong.name);
            $audio.attr('src', this.currentSong.path);
        },
        playRandomSong() {
            let newIndex;
            do {
                newIndex = this.getRandomIndex();
            } while (newIndex === this.currentIndex);
            console.log(newIndex)
            this.currentIndex = newIndex;
            this.loadCurrentSong();
        },
        nextSong() {
            this.currentIndex++;
            if (this.currentIndex >= this.songs.length) {
                this.currentIndex = 0;
            }
            this.loadCurrentSong();
        },
        prevSong() {
            this.currentIndex--;
            if (this.currentIndex <= -1) {
                this.currentIndex = this.songs.length - 1;
            }
            this.loadCurrentSong();
        },
        start() {
            //Load config
            this.loadConfig();

            // ?????nh ngh??a c??c thu???c t??nh shorthand
            this.defineProperties();

            // Load b??i h??t ?????u ti??n
            this.loadCurrentSong();

            // Render playlist
            this.render();

            // X??? l?? events
            this.handleEvents();


        }
    }

    app.start();
})