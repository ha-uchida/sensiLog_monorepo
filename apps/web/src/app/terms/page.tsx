"use client"

import { Layout } from "@/components/layout/Layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <Tabs defaultValue="ja" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ja">日本語</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="ja" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>1. はじめに</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  SensiLog（以下「本サービス」）をご利用いただきありがとうございます。
                  本利用規約（以下「本規約」）は、本サービスの利用条件を定めるものです。
                  本サービスを利用することにより、お客様は本規約に同意したものとみなされます。
                </p>
                <h4 className="text-lg font-semibold mt-4">運営者情報</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>運営者：株式会社ESG</li>
                  <li>所在地：東京都品川区</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. サービスの説明</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  本サービスは、VALORANTプレイヤー向けの感度設定管理およびパフォーマンス分析ツールです。
                  主な機能は以下のとおりです：
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>マウス感度・デバイス設定の記録と管理</li>
                  <li>VALORANTの試合データの取得と分析</li>
                  <li>感度設定とパフォーマンスの相関分析</li>
                  <li>設定履歴の追跡</li>
                </ul>
                <p className="mt-4">
                  <strong>オプトインポリシー：</strong>本サービスはオプトイン方式を採用しています。
                  プレイヤーが自ら本サービスに登録した場合にのみ、そのプレイヤーのデータが表示されます。
                  未登録のプレイヤーの情報は公開されません。
                  詳細は<a href="/privacy" className="text-primary hover:underline">プライバシーポリシー</a>をご確認ください。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. アカウント</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  本サービスの一部機能を利用するには、Riot Sign-On（RSO）を通じた認証が必要です。
                  お客様は、アカウントの機密性を維持し、アカウントで行われるすべての活動について責任を負います。
                </p>
                <p className="mt-4">
                  不正使用や不正アクセスを発見した場合は、直ちに当方にご連絡ください。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. 禁止事項</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>本サービスの利用において、以下の行為を禁止します：</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>本サービスへの不正アクセスまたは不正アクセスの試み</li>
                  <li>本サービスのスクレイピング、クローリング、または自動化されたデータ収集</li>
                  <li>本サービスのリバースエンジニアリング、逆コンパイル、または逆アセンブル</li>
                  <li>本サービスを利用した違法行為</li>
                  <li>他のユーザーの利用を妨害する行為</li>
                  <li>虚偽の情報の提供</li>
                  <li>本サービスのセキュリティ機能を回避する行為</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. 知的財産権</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  本サービスに含まれるすべてのコンテンツ、機能、およびデザインは、
                  著作権法およびその他の知的財産法により保護されています。
                </p>
                <p className="mt-4">
                  VALORANT、Riot Games、およびそれらに関連するすべての商標は、
                  Riot Games, Inc.の所有物です。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. 免責事項</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  <strong>Riot Gamesとの関係：</strong>本サービスはRiot Gamesが承認したものではなく、
                  Riot Gamesまたは公式にRiot Gamesとパートナーシップを結んでいる者とは関係ありません。
                </p>
                <p className="mt-4">
                  <strong>無保証：</strong>本サービスは「現状のまま」提供され、
                  明示的または黙示的を問わず、いかなる種類の保証も行いません。
                  本サービスの利用はお客様自身の責任において行ってください。
                </p>
                <p className="mt-4">
                  <strong>データの正確性：</strong>Riot Games APIから取得したデータの正確性について、
                  当方は保証しません。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. 責任の制限</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  法律で認められる最大限の範囲において、当方は、本サービスの利用または利用不能に起因する
                  いかなる間接的、偶発的、特別、結果的、または懲罰的損害についても責任を負いません。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. サービスの変更・終了</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  当方は、予告なく本サービスを変更、一時停止、または終了する権利を留保します。
                  また、本規約は随時更新される場合があります。
                  重要な変更がある場合は、本サービス上で通知します。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. 準拠法</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  本規約は日本法に準拠し、解釈されるものとします。
                  本規約に関連する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. お問い合わせ</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  本規約に関するご質問やご意見は、以下の連絡先までお願いいたします：
                </p>
                <p className="mt-4">
                  <strong>Email:</strong> sensilog_sup@e-sportsgg.com
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="en" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Thank you for using SensiLog (&quot;the Service&quot;).
                  These Terms of Service (&quot;Terms&quot;) govern your use of the Service.
                  By using the Service, you agree to be bound by these Terms.
                </p>
                <h4 className="text-lg font-semibold mt-4">Operator Information</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Operator: ESG Inc.</li>
                  <li>Location: Shinagawa-ku, Tokyo, Japan</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Service Description</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  The Service is a sensitivity settings management and performance analysis tool for VALORANT players.
                  Key features include:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Recording and managing mouse sensitivity and device settings</li>
                  <li>Retrieving and analyzing VALORANT match data</li>
                  <li>Correlation analysis between sensitivity settings and performance</li>
                  <li>Tracking settings history</li>
                </ul>
                <p className="mt-4">
                  <strong>Opt-In Policy:</strong> This Service operates on an opt-in basis.
                  Player data is only displayed when the player has voluntarily registered for this Service.
                  Information of unregistered players will not be made available.
                  Please refer to our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> for details.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Accounts</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Some features of the Service require authentication through Riot Sign-On (RSO).
                  You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
                </p>
                <p className="mt-4">
                  Please notify us immediately if you discover any unauthorized use or access to your account.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Prohibited Activities</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>The following activities are prohibited when using the Service:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Unauthorized access or attempts to gain unauthorized access to the Service</li>
                  <li>Scraping, crawling, or automated data collection from the Service</li>
                  <li>Reverse engineering, decompiling, or disassembling the Service</li>
                  <li>Illegal activities using the Service</li>
                  <li>Interfering with other users&apos; use of the Service</li>
                  <li>Providing false information</li>
                  <li>Circumventing security features of the Service</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  All content, features, and design included in the Service are protected by copyright and other intellectual property laws.
                </p>
                <p className="mt-4">
                  VALORANT, Riot Games, and all related trademarks are the property of Riot Games, Inc.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Disclaimers</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  <strong>Relationship with Riot Games:</strong> This Service is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties.
                </p>
                <p className="mt-4">
                  <strong>No Warranty:</strong> The Service is provided &quot;as is&quot; without any warranties of any kind, either express or implied. Your use of the Service is at your own risk.
                </p>
                <p className="mt-4">
                  <strong>Data Accuracy:</strong> We do not guarantee the accuracy of data retrieved from the Riot Games API.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use or inability to use the Service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Changes and Termination</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  We reserve the right to modify, suspend, or terminate the Service at any time without notice.
                  These Terms may be updated from time to time.
                  We will notify you of significant changes through the Service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of Japan.
                  Any disputes relating to these Terms shall be subject to the exclusive jurisdiction of the Tokyo District Court.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  If you have any questions or concerns about these Terms, please contact us at:
                </p>
                <p className="mt-4">
                  <strong>Email:</strong> sensilog_sup@e-sportsgg.com
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
