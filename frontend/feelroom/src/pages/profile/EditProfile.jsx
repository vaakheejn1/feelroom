import { User, Upload, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../../api/profile'; // profileAPI 임포트

const EditProfile = ({ onSave, onCancel }) => {
    // 기존 상태
    const [nickname, setNickname] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState(''); // 아이디 추가
    const navigate = useNavigate();

    // 이미지 관련 상태
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [tempPreviewUrl, setTempPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageMessage, setImageMessage] = useState('');

    // 프로필 저장 상태
    const [savingProfile, setSavingProfile] = useState(false);

    // 토큰 가져오기 함수
    const getAuthToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('⚠️ authToken이 없습니다.');
            return null;
        }
        return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    };

    // 컴포넌트 마운트 시 초기 프로필 이미지 URL을 로드
    useEffect(() => {
        const loadUserProfile = async () => {
            setImageMessage('프로필 정보 로드 중...');
            const result = await profileAPI.getMyProfile();
            if (result.success) {
                const userData = result.data;
                setNickname(userData.nickname);
                setDescription(userData.description);
                setEmail(userData.email);
                setUsername(userData.username); // 아이디 설정
                setProfileImageUrl(userData.profileImageUrl || '');
                setImageMessage('프로필 로드 완료.');
            } else {
                console.error('프로필 정보 로드 실패:', result.error);
                setImageMessage(`프로필 로드 실패: ${result.error}`);
            }
        };
        loadUserProfile();
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setTempPreviewUrl(URL.createObjectURL(file));
            setImageMessage('');
        } else {
            setProfileImageFile(null);
            setTempPreviewUrl(null);
        }
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleImageUpload = async () => {
        if (!profileImageFile) {
            setImageMessage('업로드할 파일을 먼저 선택해주세요!');
            return;
        }

        setUploadingImage(true);
        setImageMessage('이미지 업로드 중...');

        try {
            // 1. 백엔드로부터 Presigned URL 요청
            const presignedResult = await profileAPI.getPresignedImageUrl(profileImageFile.name); // userId 제거
            if (!presignedResult.success) {
                throw new Error(presignedResult.error || 'Presigned URL 발급 실패');
            }
            const { presignedUrl, objectKey } = presignedResult.data;
            // console.log('발급받은 Presigned URL:', presignedUrl);
            // console.log('발급받은 Object Key:', objectKey);

            // 2. Presigned URL을 사용하여 S3에 파일 직접 업로드 (PUT 요청)
            const uploadToS3Result = await profileAPI.uploadFileToS3(presignedUrl, profileImageFile);
            if (!uploadToS3Result.success) {
                throw new Error(uploadToS3Result.error || 'S3에 파일 업로드 실패');
            }
            // console.log('S3에 파일 업로드 성공!');
            setImageMessage('S3에 파일 업로드 성공! DB 업데이트 중...');

            // 3. 백엔드에 DB 업데이트 요청 (S3에 업로드된 objectKey 전달)
            const dbUpdateResult = await profileAPI.updateProfileImageUrlInDB(objectKey);
            if (!dbUpdateResult.success) {
                throw new Error(dbUpdateResult.error || 'DB 프로필 이미지 URL 업데이트 실패');
            }
            // console.log('DB에 프로필 이미지 URL 업데이트 성공!');
            setImageMessage('프로필 이미지가 성공적으로 변경되었습니다!');

            // 4. 상태 업데이트: 현재 프로필 이미지 URL을 새로 업로드된 이미지로 변경
            // (DB 업데이트가 되었으므로, 다시 프로필 정보를 조회하여 최신 URL을 가져옴)
            const getProfileResult = await profileAPI.getMyProfile();
            if (getProfileResult.success) {
                setProfileImageUrl(getProfileResult.data.profileImageUrl);
                setProfileImageFile(null);
                setTempPreviewUrl(null);
                setImageMessage('업로드 완료 및 최신 프로필 이미지 표시');
            } else {
                console.error('최신 프로필 URL 가져오기 실패:', getProfileResult.error);
                setImageMessage('업로드 완료. 최신 이미지 URL을 가져오지 못했습니다.');
            }

        } catch (error) {
            console.error('이미지 업로드 전체 실패:', error);
            setImageMessage(`업로드 실패: ${error.message}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImageCancel = () => {
        setProfileImageFile(null);
        setTempPreviewUrl(null);
        setImageMessage('');
        // '이미지 삭제' 기능이 필요하다면:
        // 1. S3에서 이미지 삭제 (백엔드 API 호출 필요)
        // 2. DB에서 profileImageUrl을 null 또는 기본 이미지 URL로 업데이트 (백엔드 API 호출 필요)
        // 3. profileImageUrl 상태를 업데이트 (setProfileImageUrl(null or 'default_url'))
    };

    // 프로필 수정 API 호출
    const updateProfile = async (nickname, description) => {
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                return { success: false, error: '로그인이 필요합니다.' };
            }

            const response = await fetch('https://i13d208.p.ssafy.io/api/v1/users/me/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nickname,
                    description
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: 프로필 수정 실패`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('프로필 수정 실패:', error);
            return { success: false, error: error.message };
        }
    };

    const handleSave = async () => {
        try {
            // console.log('프로필 저장 시작:', { nickname, description });

            // 닉네임 유효성 검사
            if (!nickname.trim()) {
                alert('닉네임을 입력해주세요.');
                return;
            }

            setSavingProfile(true);

            // API 호출
            const result = await updateProfile(nickname, description);

            if (result.success) {
                // console.log('프로필 수정 성공:', result.data);
                alert('프로필이 성공적으로 수정되었습니다.');
                navigate('/profile');
                if (onSave) onSave();
            } else {
                console.error('프로필 수정 실패:', result.error);
                alert(`프로필 수정 실패: ${result.error}`);
            }
        } catch (error) {
            console.error('프로필 수정 중 오류:', error);
            alert('프로필 수정 중 오류가 발생했습니다.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
        if (onCancel) onCancel();
    };

    const handleUsernameEdit = () => {
        alert('구현 예정');
    };

    const displayImageUrl = tempPreviewUrl || profileImageUrl;

    return (
        <div style={{
            padding: '1.5rem',
            maxWidth: '600px',
            margin: '0 auto',
            boxSizing: 'border-box'
        }}>
            <h2 style={{
                textAlign: 'center',
                marginBottom: '2rem',
                fontWeight: 'bold'
            }}>
                프로필 수정
            </h2>

            <div style={{
                display: 'flex',
                gap: '1.5rem',
                marginBottom: '2rem',
                alignItems: 'flex-start'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold'
                    }}>
                        프로필 사진
                    </label>
                    <div style={{
                        width: 96,
                        height: 96,
                        backgroundColor: '#ccc',
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                        marginBottom: '1rem'
                    }}>
                        {displayImageUrl ? (
                            <img
                                src={displayImageUrl}
                                alt="프로필 이미지"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <User style={{ width: 32, height: 32, color: '#666' }} />
                        )}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        alignItems: 'center'
                    }}>
                        <button
                            onClick={handleUploadButtonClick}
                            style={{
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.5rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                            disabled={uploadingImage}
                        >
                            <Upload size={16} style={{ marginRight: '0.3rem' }} />
                            {profileImageFile ? '이미지 변경' : '이미지 선택'}
                        </button>
                        {profileImageFile && (
                            <button
                                onClick={handleImageUpload}
                                style={{
                                    background: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.5rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                                disabled={uploadingImage}
                            >
                                <Upload size={16} style={{ marginRight: '0.3rem' }} />
                                {uploadingImage ? '업로드 중...' : '업로드 확정'}
                            </button>
                        )}
                        {(profileImageFile || profileImageUrl) && (
                            <button
                                onClick={handleImageCancel}
                                style={{
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.5rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                                disabled={uploadingImage}
                            >
                                <X size={16} style={{ marginRight: '0.3rem' }} />
                                {profileImageFile ? '선택 취소' : '이미지 삭제'}
                            </button>
                        )}
                    </div>
                    {imageMessage && (
                        <p style={{ fontSize: '0.85rem', color: uploadingImage ? 'blue' : (imageMessage.includes('실패') ? 'red' : 'green'), marginTop: '0.5rem', textAlign: 'center' }}>
                            {imageMessage}
                        </p>
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 'bold'
                        }}>
                            이메일
                        </label>
                        <div style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: '#f9fafb',
                            color: '#6b7280',
                            boxSizing: 'border-box'
                        }}>
                            {email}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 'bold'
                        }}>
                            아이디
                        </label>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                flex: 1,
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                backgroundColor: '#f9fafb',
                                color: '#6b7280',
                                boxSizing: 'border-box'
                            }}>
                                {username}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                }}>
                    닉네임
                </label>
                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                    }}
                />
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                }}>
                    소개
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                    }}
                />
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem'
            }}>
                <button
                    onClick={handleSave}
                    disabled={savingProfile}
                    style={{
                        background: savingProfile ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.7rem 2rem',
                        cursor: savingProfile ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                >
                    {savingProfile ? '저장 중...' : '저장'}
                </button>
                <button
                    onClick={handleCancel}
                    disabled={savingProfile}
                    style={{
                        background: savingProfile ? '#6c757d' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.7rem 2rem',
                        cursor: savingProfile ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                >
                    취소
                </button>
            </div>
        </div>
    );
};

export default EditProfile;